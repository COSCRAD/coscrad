import { Body, Controller, Post, Query, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import isStringWithNonzeroLength from '../../../lib/utilities/isStringWithNonzeroLength';
import httpStatusCodes from '../../constants/httpStatusCodes';
import CommandHandlerService from './CommandHandler.service';
import { TestCommand } from './Test.command';

@ApiTags('commands')
@Controller('commands')
export class CommandController {
    constructor(private readonly commandHandlerService: CommandHandlerService) {}

    @ApiOkResponse()
    @Post('')
    async issueCommand(@Res() res, @Query('type') type: string, @Body() payload: TestCommand) {
        if (!isStringWithNonzeroLength(type))
            return res
                .status(httpStatusCodes.badRequest)
                .send(`Invalid command type: ${JSON.stringify(type)}`);

        console.log(`You issued the command: ${type}`);

        const command = plainToInstance(TestCommand, payload);

        console.log({
            commandPayload: command,
        });

        const result = await this.commandHandlerService.execute(
            plainToInstance(TestCommand, payload)
        );

        if (result === 'ack') return res.status(httpStatusCodes.ok).send();

        res.status(httpStatusCodes.internalError).send(`Oopsie!`);
    }
}
