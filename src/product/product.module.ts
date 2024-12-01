import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from './enities/product.entity';

import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { RoleModule } from 'src/role/role.module';

import { ProductController } from './product.controller';

import { ProductService } from './product.service';
import { S3CoreModule } from 'src/s3/src/s3.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]),
    UserModule,
    AuthModule,
    RoleModule,
    S3CoreModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule { }