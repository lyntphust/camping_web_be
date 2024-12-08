import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { ProductCart } from 'src/product/enities/product-cart.entity';
import { S3CoreService } from 'src/s3/src';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(ProductCart)
    private readonly productCartRepository: Repository<ProductCart>,
    private readonly roleService: RoleService,
    private readonly s3Service: S3CoreService,
  ) {}

  async findAll() {
    const users = await this.userRepository.find({
      relations: ['role'],
    });

    return users;
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
    });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await this.productCartRepository.save(existingCartItem);
    } else {
      await this.productCartRepository.save({ productId, userId, quantity });
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
        (acc, curr) => acc + curr.productVariant.price * curr.quantity,
        0,
      ),
      items: productCarts,
    };
  }
}
