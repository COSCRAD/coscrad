import { Ack, CommandHandlerService } from '@coscrad/commands';
import { isStringWithNonzeroLength } from '@coscrad/validation';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import httpStatusCodes from '../constants/httpStatusCodes';
import { CommandFSA } from './command-fsa.entity';

@ApiTags('commands')
@Controller('commands')
export class CommandController {
    constructor(private readonly commandHandlerService: CommandHandlerService) {}

    @Post('')
    async executeCommand(@Res() res, @Body() commandFSA: CommandFSA) {
        if (isNullOrUndefined(commandFSA))
            return res
                .status(httpStatusCodes.badRequest)
                .send(`You must provide a Flux Standard Action on the payload`);

        const { type, payload } = commandFSA;

        if (!isStringWithNonzeroLength(type)) {
            return res
                .status(httpStatusCodes.badRequest)
                .send(`Command type must be a non-empty string`);
        }

        if (isNullOrUndefined(payload)) {
            return res
                .status(httpStatusCodes.badRequest)
                .send(`You must provide a payload for the command`);
        }

        const result = await this.commandHandlerService.execute({ type, payload });

        if (result !== Ack) return res.status(httpStatusCodes.badRequest).send(result.toString());

        return res.status(httpStatusCodes.ok).send();
    }
}
