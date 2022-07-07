import { MediaItem } from '@coscrad/api-interfaces';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CommandInfoService } from './controllers/command/services/command-info-service';
import { Message } from './message.entity';

/**
 * These endpoints are strictly for experimentation.
 */

@ApiTags('sanity checks')
@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly commandInfoService: CommandInfoService
    ) {}

    @ApiBearerAuth('JWT')
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
