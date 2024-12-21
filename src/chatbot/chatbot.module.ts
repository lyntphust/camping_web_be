import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Product } from 'src/product/enities/product.entity';
import { Blog } from 'src/user/entities/blog.entity';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { ChatbotHistory } from './entities/chatbot-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatbotHistory, Product, Blog]),
    ConfigModule,
  ],
  controllers: [ChatbotController],
  providers: [
    ChatbotService,
    {
      provide: OpenAI,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('OPENAI_API_KEY');

        return new OpenAI({ apiKey });
      },
      inject: [ConfigService],
    },
  ],
  exports: [ChatbotService],
})
export class ChatbotModule {}
