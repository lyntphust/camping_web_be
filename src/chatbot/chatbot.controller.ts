import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { AuthPayload, GetUser } from 'src/decorator/getUser.decorator';
import { ChatbotService } from './chatbot.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChatHistoryCreateDto } from './dto/chat-history-create.dto';

@Controller('chatbot')
@ApiBearerAuth()
@ApiTags('Chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  /**
   * Handle a chat message from the user.
   * @param userId - The ID of the user sending the message.
   * @param message - The message content from the user.
   * @returns The chatbot's response.
   */
  @Post()
  async sendMessage(
    @GetUser() user: AuthPayload,
    @Body() data: ChatHistoryCreateDto,
  ) {
    if (!user.id || !data.content) {
      throw new HttpException(
        'Missing user ID or message content',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const response = await this.chatbotService.getChatResponse(
        user.id,
        data.content,
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
