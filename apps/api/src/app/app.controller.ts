import { MediaItem } from '@coscrad/api-interfaces';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOkResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Message } from './message.entity';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('hello')
    getData(): MediaItem {
        return this.appService.getData();
    }
    @Get('')
    @ApiOkResponse({ type: Message })
    getWelcomeMessage(): Message {
        return { message: 'Welcome to the COSCRAD API!' };
    }
}
