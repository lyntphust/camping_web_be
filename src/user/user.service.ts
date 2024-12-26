import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { FavoriteProduct } from 'src/product/entities/favorite-product.entity';
import { ProductCart } from 'src/product/entities/product-cart.entity';
import { ProductVariant } from 'src/product/entities/product-variant.entity';
import { Product } from 'src/product/entities/product.entity';
import { S3CoreService } from 'src/s3/src';
import { RoleService } from '../role/role.service';
import { UpdatePasswordDto } from './dto/updatePasswordDto';
import * as bcrypt from 'bcrypt';

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


  async updateUser(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async updatePassword(userId: number, updatePasswordDto: UpdatePasswordDto) {
    const user = await this.userRepository.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }
  
    const isPasswordMatching = await bcrypt.compare(updatePasswordDto.currentPassword, user.password);
    if (!isPasswordMatching) {
      throw new Error('Current password is incorrect.');
    }
  
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 7);
    user.password = hashedPassword;
    return await this.userRepository.save(user);
  }
  

  
  async getUserById(userId: number) {
    const user = await this.userRepository.find({where:{id:userId},relations:['role']});
    delete user['password'];
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

  const favoriteProducts = await Promise.all(
    favorites.map(async (fav) => {
      const photoLink = await this.s3Service.getLinkFromS3(fav.product.photo);
      return {
        productId: fav.product.id,
        name: fav.product.name,
        price: fav.product.price,
        discount: fav.product.discount,
        photo: photoLink,
      };
    }),
  );

  return favoriteProducts;
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

  async getAllUser(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit; // Tính số bản ghi cần bỏ qua
    const [users] = await this.userRepository.findAndCount({
      skip,
      take: limit,
    });
    const sanitizedUsers = users.map((user) => {
      const { password, ...rest } = user; // Loại bỏ trường `password`
      return rest;
    });
  
    return sanitizedUsers;
  }

  async deleteUser(userId: number): Promise<{ message: string; user?: User }> {
    const userFound = await this.userRepository.findOne(userId);
  
    if (!userFound) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  
    await this.userRepository.delete(userId);
  
    return {
      message: `User with ID ${userId} has been successfully deleted`,
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
