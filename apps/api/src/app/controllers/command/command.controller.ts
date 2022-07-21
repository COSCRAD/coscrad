import { Ack, CommandHandlerService } from '@coscrad/commands';
import {
    Body,
    Controller,
    Post,
    Request,
    Res,
    UnauthorizedException,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { isValid } from '../../../domain/domainModelValidators/Valid';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import httpStatusCodes from '../../constants/httpStatusCodes';
import { CommandWithGivenTypeNotFoundExceptionFilter } from '../exception-handling/exception-filters/command-with-given-type-not-found.filter';
import { NoCommandHandlerForCommandTypeFilter } from '../exception-handling/exception-filters/no-command-handler-for-command-type.filter';
import sendInternalResultAsHttpResponse from '../resources/common/sendInternalResultAsHttpResponse';
import { CommandFSA } from './command-fsa/command-fsa.entity';
import validateCommandFSAType from './command-fsa/validateCommandFSAType';

export const AdminJwtGuard = AuthGuard('jwt');

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

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('')
    async executeCommand(@Request() req, @Res() res, @Body() commandFSA: CommandFSA) {
        const { user } = req;

        if (!user || !(user instanceof CoscradUserWithGroups)) {
            throw new UnauthorizedException();
        }

        if (!user.isAdmin()) {
            throw new UnauthorizedException();
        }

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
