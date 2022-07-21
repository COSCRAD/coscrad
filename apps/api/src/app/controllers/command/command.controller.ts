import { Ack, CommandHandlerService } from '@coscrad/commands';
import { Body, Controller, Post, Res, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { isValid } from '../../../domain/domainModelValidators/Valid';
import httpStatusCodes from '../../constants/httpStatusCodes';
import { CommandWithGivenTypeNotFoundExceptionFilter } from '../exception-handling/exception-filters/command-with-given-type-not-found.filter';
import { NoCommandHandlerForCommandTypeFilter } from '../exception-handling/exception-filters/no-command-handler-for-command-type.filter';
import sendInternalResultAsHttpResponse from '../resources/common/sendInternalResultAsHttpResponse';
import { CommandFSA } from './command-fsa/command-fsa.entity';
import validateCommandFSAType from './command-fsa/validateCommandFSAType';

@ApiTags('commands')
@Controller('commands')
/**
 * The next two filters convert a thrown error to a returned error (400) when an
 * invalid command type is provided by the user.
 */
@UseFilters(new CommandWithGivenTypeNotFoundExceptionFilter())
@UseFilters(new NoCommandHandlerForCommandTypeFilter())
export class CommandController {
    constructor(private readonly commandHandlerService: CommandHandlerService) {}

    @Post('')
    async executeCommand(@Res() res, @Body() commandFSA: CommandFSA) {
        const commandFSATypeValidationResult = validateCommandFSAType(commandFSA);

        if (!isValid(commandFSATypeValidationResult))
            return res
                .status(httpStatusCodes.badRequest)
                .send(commandFSATypeValidationResult.toString());

        const { type, payload } = commandFSA;

        const result = await this.commandHandlerService.execute({ type, payload });

        if (result !== Ack) return sendInternalResultAsHttpResponse(res, result);

        return res.status(httpStatusCodes.ok).send();
    }
}
