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
import CommandExecutionError from '../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import httpStatusCodes from '../../constants/httpStatusCodes';
import sendInternalResultAsHttpResponse from '../resources/common/sendInternalResultAsHttpResponse';
import { CommandFSA } from './command-fsa/command-fsa.entity';
import { CommandWithGivenTypeNotFoundExceptionFilter } from './exception-handling/exception-filters/command-with-given-type-not-found.filter';
import { NoCommandHandlerForCommandTypeFilter } from './exception-handling/exception-filters/no-command-handler-for-command-type.filter';

export const AdminJwtGuard = AuthGuard('jwt');

const COMMAND_ACKNOWLEDGEMENT_BODY_TEXT = 'ACK';

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
 *
 * We might want to use returned errors intead of throwing in these situations.
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
        const { type, payload, meta } = commandFSA;

        const { contributorIds } = meta || { contributorIds: [] };

        const result = await this.commandHandlerService.execute(
            { type, payload },
            /**
             * TODO Validate contributor existence in middleware
             */
            { userId: user.id, contributorIds }
        );

        if (result !== Ack) {
            return sendInternalResultAsHttpResponse(
                res,
                isInternalError(result)
                    ? result
                    : new CommandExecutionError([new InternalError(result.message)])
            );
        }

        this.commandResultSubject.next({
            data: {
                aggregateCompositeIdentifier: {
                    type: payload[AGGREGATE_COMPOSITE_IDENTIFIER].type,
                    /**
                     * Note we do not publish IDs over a public channel.
                     * This means that the client needs to refresh the entire
                     * client-side cache of the resources of a given type on update.
                     * This is currenlty only used for the admin UX.
                     *
                     * TODO Move to a web-sockets implementation.
                     */
                },
            },
        });

        return res.status(httpStatusCodes.ok).send(COMMAND_ACKNOWLEDGEMENT_BODY_TEXT);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('bulk')
    async executeCommandStream(
        @Request() req,
        @Res() res,
        @Body() { stream: commandStream }: { stream: CommandFSA[] }
    ) {
        const { user } = req;

        if (!user || !(user instanceof CoscradUserWithGroups)) {
            throw new UnauthorizedException();
        }

        if (!user.isAdmin()) {
            throw new UnauthorizedException();
        }

        // TODO[test-coverage] validate that additional meta comes through at the integration level (we have e2e tests of this)
        const resultsForAllCommands = await this.commandHandlerService.executeStream(
            commandStream.map(({ type, payload, meta }) => ({
                type,
                payload,
                meta: {
                    userId: user.id,
                    contributorIds: meta?.contributorIds || [],
                },
            }))
        );

        if (
            resultsForAllCommands.some(
                (singleCommandResultRecord) => singleCommandResultRecord.result !== Ack
            )
        ) {
            return res.status(httpStatusCodes.badRequest).send({
                results: resultsForAllCommands.map(({ fsa, result }) => {
                    return {
                        fsa,
                        result:
                            result instanceof Error
                                ? result.toString()
                                : COMMAND_ACKNOWLEDGEMENT_BODY_TEXT,
                    };
                }),
            });
        }

        return res.status(httpStatusCodes.ok).send({
            results: resultsForAllCommands.map(({ fsa }) => ({
                fsa,
                result: COMMAND_ACKNOWLEDGEMENT_BODY_TEXT,
            })),
        });
    }

    @Sse('notifications')
    commandSuccessNotifications(): Observable<MessageEvent> {
        return this.commandResultSubject.asObservable();
    }
}
