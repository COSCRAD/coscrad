import { Ack, CommandHandlerService } from '@coscrad/commands';
import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { isValid } from '../../../domain/domainModelValidators/Valid';
import httpStatusCodes from '../../constants/httpStatusCodes';
import { CommandFSA } from './command-fsa/command-fsa.entity';
import validateCommandFSAType from './command-fsa/validateCommandFSAType';

@ApiTags('commands')
@Controller('commands')
export class CommandController {
    constructor(private readonly commandHandlerService: CommandHandlerService) {}

    @Post('')
    async executeCommand(@Res() res, @Body() commandFSA: CommandFSA) {
        const commandFSATypeValidationResult = validateCommandFSAType(commandFSA);

        if (!isValid(commandFSATypeValidationResult))
            res.status(httpStatusCodes.badRequest).send(commandFSATypeValidationResult.toString());

        const { type, payload } = commandFSA;

        const result = await this.commandHandlerService.execute({ type, payload });

        if (result !== Ack) return res.status(httpStatusCodes.badRequest).send(result.toString());

        return res.status(httpStatusCodes.ok).send();
    }
}
