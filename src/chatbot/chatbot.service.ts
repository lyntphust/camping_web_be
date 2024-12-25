import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/user/entities/blog.entity';
import { Repository } from 'typeorm';
import { ChatbotHistoryRole } from './entities/chatbot-history.entity';
import { Product } from 'src/product/entities/product.entity';

@Injectable()
export class ChatbotService {
  constructor(
    private genAI: GoogleGenerativeAI,
    private genAIModel: GenerativeModel,
    private chatSessions: Object,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {
    this.genAIModel = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });
    this.chatSessions = {};
  }

  private async getWebsiteInfo() {
    const products = await this.productRepository.find();
    const blogs = await this.blogRepository.find();

    return [
      {
        role: ChatbotHistoryRole.USER,
        parts: [
          {
            text: `
          Remember that you are a website which provides camping equipments shopping and sharing blogs.
          I am a user to your website.
          - Some of the products you have are:
          ${products
            .map(
              ({ name, description, price }) => `
            + ${name}: ${description} ($${price})
            `,
            )
            .join('')}
          - Some of the blogs you have are:
          ${blogs.map(
            ({ text, location }) => `
            + ${text} (${location})
            Remember to response in the current message of the user.
            `,
          )}
        `,
          },
        ],
      },
    ];
  }

  async getChatResponse(userMessage: string, sessionId?: string) {
    let sessionToUse = sessionId ?? Math.random().toString();

    let resultSession = this.chatSessions[sessionToUse];

    if (!resultSession) {
      // Get products and blogs data from the website
      const history = await this.getWebsiteInfo();

      resultSession = this.genAIModel.startChat({ history });

      this.chatSessions[sessionToUse] = resultSession;
    }

    // Call OpenAI API
    const result = await resultSession.sendMessage(userMessage);

    const assistantMessage = result.response.text() || '';

    return { message: assistantMessage, sessionId: sessionToUse };
  }
}
