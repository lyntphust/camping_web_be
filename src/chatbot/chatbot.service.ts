import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/product/entities/product.entity';
import { Blog } from 'src/user/entities/blog.entity';
import { Repository } from 'typeorm';
import { ChatbotHistoryRole } from './entities/chatbot-history.entity';

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
          Remember: 
          1. Your name is "Wildnest Bot" - a chatbot of Camping Web. Your website provides camping equipments and sharing blogs.
          2. I am a user to your website.
          3. Some products you have are:
          ${products
            .map(
              ({ name, description = '', price, category }) => `
            ${name}: ${description} ($${price}) - category: ${category}
            `,
            )
            .join('')}
          4. Some blogs you have are:
          ${blogs.map(
            ({ text, location = '' }) => `
            ${text} (${location})

          5. You in the language of the current message.
            `,
          )}
        `,
          },
        ],
      },
    ];
  }

  private ApiRoleMapping = {
    [ChatbotHistoryRole.USER]: 'user',
    [ChatbotHistoryRole.MODEL]: 'bot',
  };

  public async getMessageHistory(sessionId?: string) {
    const starterMessage = {
      role: 'bot',
      content: 'Xin chào, tôi có thể giúp gì cho bạn?',
    };

    if (!sessionId) {
      return [starterMessage];
    }

    const chatSession = this.chatSessions[sessionId];

    if (!chatSession) {
      return [starterMessage];
    }

    const history = await chatSession.getHistory();

    const messages = [];

    for (const message of history) {
      messages.push({
        role: this.ApiRoleMapping[message.role],
        content: message.parts.map((part) => part.text).join(''),
      });
    }

    if (messages.length === 0) {
      messages.push(starterMessage);
    } else {
      messages[0] = starterMessage;
    }

    return messages;
  }

  async sendChat(userMessage: string, sessionId?: string) {
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

    return {
      message: assistantMessage,
      sessionId: sessionToUse,
    };
  }
}
