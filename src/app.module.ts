import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { APP_GUARD } from '@nestjs/core';
import { StripeModule } from 'nestjs-stripe';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { ChatbotHistory } from './chatbot/entities/chatbot-history.entity';
import { CommentModule } from './comment/comment.module';
import { Order } from './order/entities/order.entity';
import { OrdersProducts } from './order/entities/orders-products.entity';
import { OrderModule } from './order/order.module';
import { ProductCart } from './product/entities/product-cart.entity';
import { ProductVariant } from './product/entities/product-variant.entity';
import { Product } from './product/entities/product.entity';
import { ProductModule } from './product/product.module';
import { Role } from './role/entities/role.entity';
import { RoleModule } from './role/role.module';
import { TokenModule } from './token/token.module';
import { Permission } from './user/entities/permission.entity';
import { User } from './user/entities/user.entity';
import { UserModule } from './user/user.module';

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
        ProductVariant,
        ChatbotHistory,
      ],
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
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
    ChatbotModule,
    CommentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
