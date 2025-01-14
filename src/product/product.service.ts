import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Product } from './entities/product.entity';

import { S3CoreService } from 'src/s3/src';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductDto, ProductVariantDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductVariant } from './entities/product-variant.entity';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly s3Service: S3CoreService,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {}

  async findAll() {
    const products = await this.productRepository.find({
      relations: ['variants'],
    });
    for (let i = 0; i < products.length; i++) {
      const link = await this.s3Service.getLinkFromS3(products[i].photo);
      products[i]['image'] = link;
    }
    return products;
  }

  async findBySearchText(searchText = '') {
    const products = await this.productRepository
      .createQueryBuilder()
      .where('name ILIKE :searchText', { searchText: `%${searchText}%` })
      .orWhere('category ILIKE :searchText', { searchText: `%${searchText}%` })
      .orWhere('description ILIKE :searchText', {
        searchText: `%${searchText}%`,
      })
      .getMany();

    products.forEach(async (product) => {
      const link = await this.s3Service.getLinkFromS3(product.photo);
      product['image'] = link;
    });

    return products;
  }

  async findAllByCategory(category: string) {
    const products = await this.productRepository.findOne({ category });

    return products;
  }

  async findAllVariants(searchText = '', ids?: number[]) {
    if (ids?.length === 1 && ids[0] === 0) {
      return [];
    }

    const queryBuilder =
      this.productVariantRepository.createQueryBuilder('variant');

    if (ids) {
      queryBuilder.where('variant.id IN(:...ids)', { ids });
    }

    queryBuilder.leftJoinAndSelect('variant.product', 'product').andWhere(
      new Brackets((qb) => {
        qb.where('product.name ILIKE :searchText', {
          searchText: `%${searchText}%`,
        })
          .orWhere('product.category ILIKE :searchText', {
            searchText: `%${searchText}%`,
          })
          .orWhere('product.description ILIKE :searchText', {
            searchText: `%${searchText}%`,
          })
          .orWhere('size ILIKE :searchText', {
            searchText: `%${searchText}%`,
          })
          .orWhere('color ILIKE :searchText', {
            searchText: `%${searchText}%`,
          });
      }),
    );

    const variants = await queryBuilder.getMany();

    variants.forEach(async (variant) => {
      const link = await this.s3Service.getLinkFromS3(variant.product.photo);
      variant.product['image'] = link;
    });

    return variants;
  }

  async findManyByIds(arrayOfIds: Array<number>) {
    const products = await this.productRepository
      .createQueryBuilder()
      .where('id IN(:...arrayOfIds)', { arrayOfIds })
      .getMany();

    return products;
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne(id);

    if (!product) {
      throw new NotFoundException(`There is no user under id ${id}`);
    }

    const link = await this.s3Service.getLinkFromS3(product.photo);
    product['image'] = link;

    return product;
  }

  async create(createProductDto: CreateProductDto, file: Express.Multer.File) {
    console.log(createProductDto.variants);
    // Validate file
    const isValidTypeAndSize = validateTypeImg(file[0].mimetype, file[0].size);
    if (!isValidTypeAndSize) {
      throw new BadRequestException('VALIDATE_FILE_FAILED');
    }

    // Upload file to S3
    const prefix = 'product-image';
    const key = `${prefix}/${uuidv4()}/${file[0].originalname}`;
    await this.s3Service.uploadFileWithStream(file[0].buffer, key);

    // Create and save product
    const { variants, ...productData } = createProductDto;
    const product = this.productRepository.create(productData);
    product.photo = key;
    const savedProduct = await this.productRepository.save(product);

    // Create and save product variants
    if (variants && variants.length > 0) {
      const productVariants = variants.map((variant) =>
        this.productVariantRepository.create({
          ...variant,
          price: savedProduct.price,
          stock: variant.quantity,
          product: savedProduct,
        }),
      );

      await this.productVariantRepository.save(productVariants);
    }

    return { product: savedProduct };
  }

  private async getVariantsUpdateData(
    variants: ProductVariantDto[],
    product: Product,
  ) {
    const currentVariants = await this.productVariantRepository.find({
      where: { product },
    });

    let newVariants = [];
    let updatedVariants = [];
    let deletedVariants: ProductVariant[] = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      const currentVariant = currentVariants.find(
        (v) => v.color === variant.color && v.size === variant.size,
      );

      const { quantity, ...variantData } = variant;

      if (!currentVariant) {
        newVariants.push({
          ...variantData,
          price: product.price,
          stock: quantity,
          product,
          sold: 0,
        });
      } else {
        updatedVariants.push({
          id: currentVariant.id,
          ...variantData,
          price: product.price,
          stock: quantity,
        });
      }
    }

    deletedVariants = currentVariants.filter(
      (v) =>
        !variants.find(
          (variant) => v.color === variant.color && v.size === variant.size,
        ),
    );

    return { newVariants, updatedVariants, deletedVariants };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`There is no product under id ${id}`);
    }

    const { variants, ...productData } = updateProductDto;

    productData.category = product.category;
    productData.photo = product.photo;

    const savedProduct = await this.productRepository.save({
      ...productData,
      category: product.category,
      photo: product.photo,
      id,
    });

    const { newVariants, updatedVariants, deletedVariants } =
      await this.getVariantsUpdateData(variants, savedProduct);

    // Save new variants
    if (newVariants.length > 0) {
      const productVariants = newVariants.map((variant) =>
        this.productVariantRepository.create(variant),
      );

      await this.productVariantRepository.save(productVariants.flat());
    }

    // Update existing variants
    if (updatedVariants.length > 0) {
      await Promise.all(
        updatedVariants.map((variant) => {
          this.productVariantRepository.update(variant.id, variant);
        }),
      );
    }

    // Remove deleted variants
    if (deletedVariants.length > 0) {
      await Promise.all(
        deletedVariants.map((variant) =>
          this.productVariantRepository.remove(variant),
        ),
      );
    }

    return { product: savedProduct };
  }

  async remove(id: number) {
    const product = await this.findOne(id);

    return this.productRepository.remove(product);
  }
}

const validateTypeImg = (type: string, size: number): boolean => {
  if (
    (type === process.env.UPLOAD_TYPE_PNG ||
      type === process.env.UPLOAD_TYPE_JPG) &&
    size <= Number(process.env.MAX_SIZE)
  ) {
    return true;
  } else {
    return false;
  }
};
