import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Permission } from './entities/permission.entity';
import { User } from './entities/user.entity';

import { S3CoreModule } from 'src/s3/src/s3.module';
import { RoleModule } from '../role/role.module';

import { FavoriteProduct } from 'src/product/entities/favorite-product.entity';
import { ProductCart } from 'src/product/entities/product-cart.entity';
import { ProductVariant } from 'src/product/entities/product-variant.entity';
import { Product } from 'src/product/entities/product.entity';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { BlogProduct } from './entities/blog-product.entity';
import { Blog } from './entities/blog.entity';
import { FavoriteBlog } from './entities/favorite-blog.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
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
      FavoriteBlog,
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
