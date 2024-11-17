import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { RoleModule } from './role/role.module';
import { AuthModule } from './auth/auth.module';
import { TokenModule } from './token/token.module';
import { StripeModule } from 'nestjs-stripe';
import { ProductCart } from './product/enities/product-cart.entity';
import { User } from './user/entities/user.entity';
import { Product } from './product/enities/product.entity';
import { Role } from './role/entities/role.entity';
import { Order } from './order/entities/order.entity';
import { OrdersProducts } from './order/entities/orders-products.entity';
import { Permission } from './user/entities/permission.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [
        ProductCart,
        User,
        Product,
        Role,
        Order,
        OrdersProducts,
        Permission,
      ],
      autoLoadEntities: true,
      synchronize: false,
    }),
    StripeModule.forRoot({
      apiKey: process.env.STRIPE_API_KEY,
      apiVersion: '2020-08-27',
    }),
    UserModule,
    OrderModule,
    ProductModule,
    RoleModule,
    AuthModule,
    TokenModule,
  ],
})
export class AppModule {}
