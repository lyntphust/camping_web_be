import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './enities/product.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { S3CoreService } from 'src/s3/src';
import { v4 as uuidv4 } from 'uuid';
import { ProductVariant } from './enities/product-variant.entity';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly s3Service: S3CoreService,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) { }

  async findAll() {
    const products = await this.productRepository.find({relations:['variants']});
    for (let i = 0; i < products.length; i++) {
      const link = await this.s3Service.getLinkFromS3(products[i].photo);
      products[i]['image'] = link;
    }
    return products;
  }

  async findAllByCategory(category: string) {
    const products = await this.productRepository.findOne({ category });

    return products;
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
    console.log(createProductDto.variants)
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
      const productVariants = variants.map(variant =>
        this.productVariantRepository.create({
          ...variant,
          price:savedProduct.price,
          stock:variant.quantity,
          product: savedProduct,
        }),
      );

      await this.productVariantRepository.save(productVariants);
    }

    return { product: savedProduct };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });

    if (!product) {
      throw new NotFoundException(`There is no product under id ${id}`);
    }

    return this.productRepository.save(product);
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
