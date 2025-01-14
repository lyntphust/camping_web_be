import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { S3CoreService } from 'src/s3/src';
import { Blog } from 'src/user/entities/blog.entity';
import { Repository } from 'typeorm';
import {
  ChatbotHistory,
  ChatbotHistoryRole,
} from './entities/chatbot-history.entity';

@Injectable()
export class ChatbotService {
  constructor(
    private genAI: GoogleGenerativeAI,
    private genAIModel: GenerativeModel,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
    @InjectRepository(ChatbotHistory)
    private readonly chatbotHistoryRepository: Repository<ChatbotHistory>,
    private readonly s3Service: S3CoreService,
  ) {
    this.genAIModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
  }

  private async getWebsiteInfo() {
    const products = await this.productRepository.find();
    const blogs = await this.blogRepository.find();

    return [
      {
        role: ChatbotHistoryRole.USER,
        parts: [
          {
            text: 'Tên của bạn là "Wildnest Bot" và bạn là chatbot của Camping Web.',
          },
        ],
      },
      {
        role: ChatbotHistoryRole.USER,
        parts: [
          {
            text: 'Camping Web bán các sản phẩm cắm trại và cung cấp diễn đàn blog về camping (cắm trại).',
          },
        ],
      },
      {
        role: ChatbotHistoryRole.USER,
        parts: [
          {
            text: `Các sản phẩm: 
            ${products
              .map(
                ({ id, name, description = '', price, category }) =>
                  `${id}: ${name}: ${description} (${price} VNĐ) - Category: ${category}`,
              )
              .join('')}`,
          },
        ],
      },
      {
        role: ChatbotHistoryRole.USER,
        parts: [
          {
            text: `Các bài blog: 
            ${blogs
              .map(
                ({ id, title, text, location = '' }) =>
                  `${id}: ${title}(${location}) | ${text}`,
              )
              .join('')}`,
          },
        ],
      },
    ];
  }

  public async getMessageHistory(sessionId?: string) {
    const starterMessage = {
      role: ChatbotHistoryRole.MODEL,
      content: 'Xin chào, tôi có thể giúp gì cho bạn?',
    };

    if (!sessionId) {
      return [starterMessage];
    }

    const savedHistory = await this.chatbotHistoryRepository.find({
      where: {
        sessionId,
      },
    });

    const messages = [starterMessage];

    if (savedHistory.length) {
      for (const { role, content } of savedHistory) {
        messages.push({
          role,
          content,
        });
      }
    }

    return messages;
  }

  async sendChat(userMessage: string, sessionId?: string) {
    const sessionToUse = sessionId ?? Math.random().toString();
    const history = await this.getWebsiteInfo();

    const savedHistory = await this.chatbotHistoryRepository.find({
      where: {
        sessionId: sessionToUse,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    if (savedHistory.length) {
      for (const message of savedHistory) {
        history.push({
          role: message.role,
          parts: [
            {
              text: message.content,
            },
          ],
        });
      }
    }

    const resultSession = this.genAIModel.startChat({ history });

    // Call OpenAI API
    const result = await resultSession.sendMessage(userMessage);

    const assistantMessage = result.response.text() || '';

    await this.chatbotHistoryRepository.save({
      sessionId: sessionToUse,
      role: ChatbotHistoryRole.USER,
      content: userMessage,
      createdAt: new Date(),
    });

    await this.chatbotHistoryRepository.save({
      sessionId: sessionToUse,
      role: ChatbotHistoryRole.MODEL,
      content: assistantMessage,
      createdAt: new Date(),
    });

    return {
      message: assistantMessage,
      sessionId: sessionToUse,
    };
  }
}
