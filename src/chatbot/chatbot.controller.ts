import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
      return await this.chatbotService.sendChat(data.content, data.sessionId);
    } catch (error) {
      console.error('Error in ChatbotController:', error);
      throw new HttpException(
        'Failed to process the message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/:sessionId')
  @Public()
  async getMessageHistory(@Param('sessionId') sessionId?: string) {
    try {
      return await this.chatbotService.getMessageHistory(sessionId);
    } catch (error) {
      console.error('Error in ChatbotController:', error);
      throw new HttpException(
        'Failed to process the message',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
