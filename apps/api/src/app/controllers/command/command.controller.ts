import { AGGREGATE_COMPOSITE_IDENTIFIER } from '@coscrad/api-interfaces';
import { Ack, CommandHandlerService } from '@coscrad/commands';
import {
    Body,
    Controller,
    MessageEvent,
    Post,
    Request,
    Res,
    Sse,
    UnauthorizedException,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import httpStatusCodes from '../../constants/httpStatusCodes';
import { CommandWithGivenTypeNotFoundExceptionFilter } from '../exception-handling/exception-filters/command-with-given-type-not-found.filter';
import { NoCommandHandlerForCommandTypeFilter } from '../exception-handling/exception-filters/no-command-handler-for-command-type.filter';
import sendInternalResultAsHttpResponse from '../resources/common/sendInternalResultAsHttpResponse';
import { CommandFSA } from './command-fsa/command-fsa.entity';

export const AdminJwtGuard = AuthGuard('jwt');

@ApiTags('commands')
@Controller('commands')
/**
 * TODO [https://www.pivotaltracker.com/story/show/182785593]
 * Enforce RBAC for commands in a guard isntead.
 */
/**
 * The next two filters convert a thrown error to a returned error (400) when an
 * invalid command type is provided by the user.
 *
 * TODO [https://www.pivotaltracker.com/story/show/182785593]
 * We may want to do this in a pipe in the future.
 */
@UseFilters(new CommandWithGivenTypeNotFoundExceptionFilter())
@UseFilters(new NoCommandHandlerForCommandTypeFilter())
export class CommandController {
    private readonly commandResultSubject = new Subject<MessageEvent>();

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

        /**
         * Note that we defer command type validation to the command handler.
         * This is because we want to keep the controller free of domain
         * logic. If we want to drive commands via a CLI, it shouldn't need
         * to know about http.
         */
        const { type, payload } = commandFSA;

        const result = await this.commandHandlerService.execute(
            { type, payload },
            { userId: user.id }
        );

        if (result !== Ack) return sendInternalResultAsHttpResponse(res, result);

        this.commandResultSubject.next({
            data: { aggregateCompositeIdentifier: payload[AGGREGATE_COMPOSITE_IDENTIFIER] },
        });

        return res.status(httpStatusCodes.ok).send();
    }

    @Sse('notifications')
    commandSuccessNotifications(): Observable<MessageEvent> {
        return this.commandResultSubject.asObservable();
    }
}
