import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { FavoriteProduct } from 'src/product/enities/favorite-product.entity';
import { ProductCart } from 'src/product/enities/product-cart.entity';
import { ProductVariant } from 'src/product/enities/product-variant.entity';
import { Product } from 'src/product/enities/product.entity';
import { S3CoreService } from 'src/s3/src';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ProductCart)
    private readonly productCartRepository: Repository<ProductCart>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    @InjectRepository(FavoriteProduct)
    private readonly favoriteProductRepository: Repository<FavoriteProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly roleService: RoleService,
    private readonly s3Service: S3CoreService,
  ) {}

  async getUserById(userId: number) {
    const user = await this.userRepository.findOne(userId);
    delete user.password;
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user;
  }

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['role'],
    });

    return users;
  }



 // Yêu thích 1 sản phẩm
 async addFavoriteProduct(userId: number, productId: number) {
  const product = await this.productRepository.findOne(productId);
  if (!product) {
    throw new NotFoundException(`Product with ID ${productId} not found.`);
  }

  const existingFavorite = await this.favoriteProductRepository.findOne({
    where: { user: { id: userId }, product: { id: productId } },
  });

  if (existingFavorite) {
    throw new Error(`Product with ID ${productId} is already in your favorites.`);
  }

  const favorite = this.favoriteProductRepository.create({
    user: { id: userId },
    product: { id: productId },
  });

  return await this.favoriteProductRepository.save(favorite);
}

// Xem danh sách sản phẩm yêu thích
async getFavoriteProducts(userId: number) {
  const favorites = await this.favoriteProductRepository.find({
    where: { user: { id: userId } },
    relations: ['product'],
  });

  return favorites.map((fav) => ({
    productId: fav.product.id,
    name: fav.product.name,
    price: fav.product.price,
    photo: fav.product.photo,
  }));
}

// Xóa sản phẩm khỏi danh sách yêu thích
async removeFavoriteProduct(userId: number, productId: number) {
  const favorite = await this.favoriteProductRepository.findOne({
    where: { user: { id: userId }, product: { id: productId } },
  });

  if (!favorite) {
    throw new NotFoundException(
      `Product with ID ${productId} is not in your favorites.`,
    );
  }

  await this.favoriteProductRepository.remove(favorite);

  return { message: `Product with ID ${productId} has been removed from your favorites.` };
}


  async findOne(id: number) {
    const user = await this.userRepository.findOne(id, {
      relations: ['role'],
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${id}`);
    }

    return user;
  }

  async findOneByEmail(email: string) {
    const user = await this.userRepository.findOne(
      { email },
      { relations: ['role'] },
    );

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const role = await this.roleService.findOneByName(createUserDto.roleName);

    const user = await this.userRepository.create({
      ...createUserDto,
      role,
    });

    return this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const role =
      updateUserDto.roleName &&
      (await this.roleService.findOneByName(updateUserDto.roleName));

    const user = await this.userRepository.preload({
      id,
      ...updateUserDto,
      role,
    });

    if (!user) {
      throw new NotFoundException(`There is no user under id ${id}`);
    }

    return this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    return this.userRepository.remove(user);
  }

  async addProductToCart(productId: number, userId: number, quantity: number) {
    const existingCartItem = await this.productCartRepository.findOne({
      where: { productVariantId: productId, userId },
      relations: ['productVariant', 'productVariant.product'],
    });

    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity += quantity;

      const productName = existingCartItem.productVariant.product.name;

      if (newQuantity > existingCartItem.productVariant.stock) {
        return {
          error: `Không đủ hàng cho sản phẩm ${productName}. Số lượng bạn muốn mua: ${existingCartItem.quantity}. Số lượng còn lại: ${existingCartItem.productVariant.stock}.`,
        }
      }

      await this.productCartRepository.save(existingCartItem);
    } else {
      const productVariant = await this.productVariantRepository.findOne(productId, {
        relations: ['product'],
      });

      const productName = productVariant.product.name;

      if (quantity > productVariant.stock) {
        return {
          error: `Không đủ hàng cho sản phẩm ${productName}. Số lượng còn lại: ${productVariant.stock}.`,
        }
      }

      await this.productCartRepository.save({
        productVariantId: productId,
        userId,
        quantity,
      });
    }
  }

  async getProductList(userId: number) {
    const productCarts = await this.productCartRepository
      .createQueryBuilder('productCart')
      .innerJoinAndSelect('productCart.productVariant', 'productVariant') // Join ProductVariant
      .innerJoinAndSelect('productVariant.product', 'product') // Join Product
      .where('productCart.userId = :userId', { userId })
      .select([
        'productCart.id',
        'productCart.quantity',
        'productVariant.id',
        'productVariant.size',
        'productVariant.color',
        'productVariant.price',
        'product.id',
        'product.name',
        'product.description',
        'product.photo',
        'product.discount',
      ])
      .getMany();

    if (productCarts.length === 0) {
      throw new NotFoundException(
        'No products found in the cart for this user.',
      );
    }

    for (let i = 0; i < productCarts.length; i++) {
      const imageLink = await this.s3Service.getLinkFromS3(
        productCarts[i].productVariant.product.photo,
      );

      productCarts[i].productVariant.product.photo = imageLink;
    }

    return {
      total: productCarts.reduce(
        (acc, curr) =>
          acc +
          ((curr.productVariant.price *
            (100 - curr.productVariant.product.discount)) /
            100) *
            curr.quantity,
        0,
      ),
      items: productCarts,
    };
  }

  async removeProductFromCart(productId: number, userId: number) {
    // Tìm sản phẩm trong giỏ hàng dựa trên productId và userId
    const existingCartItem = await this.productCartRepository.findOne({
      where: { productVariantId: productId, userId },
    });

    if (!existingCartItem) {
      throw new NotFoundException(
        `Product with ID ${productId} not found in the cart for user with ID ${userId}.`,
      );
    }

    // Xóa sản phẩm khỏi giỏ hàng
    await this.productCartRepository.remove(existingCartItem);

    return {
      message: `Product with ID ${productId} has been removed from the cart.`,
    };
  }
}
