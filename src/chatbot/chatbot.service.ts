import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import OpenAI from 'openai';
import { Product } from 'src/product/enities/product.entity';
import { Blog } from 'src/user/entities/blog.entity';
import { Repository } from 'typeorm';
import {
    ChatbotHistory,
    ChatbotHistoryRole,
} from './entities/chatbot-history.entity';

@Injectable()
export class ChatbotService {
  constructor(
    private openai: OpenAI,
    @InjectRepository(ChatbotHistory)
    private readonly chatbotHistoryRepository: Repository<ChatbotHistory>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Blog)
    private readonly blogRepository: Repository<Blog>,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});
  }

  async getChatResponse(userId: number, userMessage: string) {
    // Fetch conversation history
    const conversationHistory = await this.chatbotHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'ASC' },
    });

    const messages = conversationHistory.map((entry) => ({
      role: entry.role,
      content: entry.content,
    }));

    messages.push({ role: ChatbotHistoryRole.USER, content: userMessage });

    // Fetch product and blog data for context
    const products = await this.productRepository.find();

    const blogs = await this.blogRepository.find();

    const context = `
    Here are some products on our website: ${products
      .map(
        (product) =>
          `- ${product.name}: ${product.description} ($${product.price})`,
      )
      .join('\n')}
    
    Here are some recent blog posts: ${blogs
      .map((blog) => `- ${blog.location}: ${blog.text.slice(0, 100)}...`)
      .join('\n')}
    `;

    messages.push({
      role: ChatbotHistoryRole.SYSTEM,
      content: `You are a helpful assistant. Use the following website data to assist the user:\n${context}`,
    });

    // Call OpenAI API
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
    });

    const assistantMessage = response.choices[0].message.content || '';

    // Save all user, system and assistant messages
    const chatbotMessages = messages.map((message) =>
      this.chatbotHistoryRepository.create({
        userId,
        role: message.role,
        content: message.content,
      }),
    );

    await this.chatbotHistoryRepository.save(chatbotMessages);

    return assistantMessage;
  }
}
