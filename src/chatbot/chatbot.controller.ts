import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorator/public.decorator';
import { ChatbotService } from './chatbot.service';
import { ChatHistoryCreateDto } from './dto/chat-history-create.dto';

@Controller('chatbot')
@ApiTags('Chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post()
  @Public()
  async sendMessage(@Body() data: ChatHistoryCreateDto) {
    if (!data.content) {
      throw new HttpException(
        'Missing message content',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await this.chatbotService.getChatResponse(
        data.content,
        data.sessionId,
      );

      return { response };
    } catch (error) {
      console.error('Error in ChatbotController:', error);
      throw new HttpException(
        'Failed to process the message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
