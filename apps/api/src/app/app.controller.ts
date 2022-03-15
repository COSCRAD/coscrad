import { MediaItem } from '@coscrad/api-interfaces';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppService } from './app.service';

type Message = {
  message: string;
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('hello')
  getData(): MediaItem {
    return this.appService.getData();
  }
  @Get('')
  getWelcomeMessage(): Message {
    return { message: 'Welcome to the COSCRAD API!' };
  }
}
