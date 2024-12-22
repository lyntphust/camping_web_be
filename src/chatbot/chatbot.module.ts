import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
      provide: GoogleGenerativeAI,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('GOOGLE_AI_API_KEY');

        return new GoogleGenerativeAI(apiKey);
      },
      inject: [ConfigService],
    },
    {
      provide: GenerativeModel,
      useFactory: (genAI: GoogleGenerativeAI) => {
        return genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
        });
      },
      inject: [GoogleGenerativeAI],
    },
    {
      provide: Object,
      useValue: {},
    },
  ],
  exports: [ChatbotService],
})
export class ChatbotModule {}
