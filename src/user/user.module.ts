import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { Permission } from './entities/permission.entity';

import { RoleModule } from '../role/role.module';
import { S3CoreModule } from 'src/s3/src/s3.module';

import { UserService } from './user.service';
import { ProductCart } from 'src/product/entities/product-cart.entity';
import { ProductVariant } from 'src/product/entities/product-variant.entity';
import { UserController } from './user.controller';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { Blog } from './entities/blog.entity';
import { BlogProduct } from './entities/blog-product.entity';
import { Product } from 'src/product/entities/product.entity';
import { FavoriteProduct } from 'src/product/entities/favorite-product.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Permission,
      ProductCart,
      ProductVariant,
      Blog,
      Product,
      FavoriteProduct,
      BlogProduct,
    ]),
    RoleModule,
    S3CoreModule,
  ],
  controllers: [UserController, BlogController],
  providers: [UserService, BlogService],
  exports: [UserService],
})
export class UserModule {}
