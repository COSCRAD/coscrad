import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    CoscradUserRole,
    HttpStatusCode,
} from '@coscrad/api-interfaces';
import { Ack, CommandHandlerService } from '@coscrad/commands';
import {
    Body,
    Controller,
    Get,
    Inject,
    MessageEvent,
    Param,
    Post,
    Request,
    Res,
    Sse,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable, Subject } from 'rxjs';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../domain/interfaces/id-manager.interface';
import CommandExecutionError from '../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { isNotFound } from '../../../lib/types/not-found';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import sendInternalResultAsHttpResponse from '../resources/common/sendInternalResultAsHttpResponse';
import {
    BULK_JOB_REPOSITORY_INJECTION_TOKEN,
    IBulkJobRepository,
} from './bulk-imports/bulk-job-repository.interface';
import {
    COMMAND_ACKNOWLEDGEMENT_BODY_TEXT,
    CommandExecutionService,
} from './command-execution.service';
import { CommandFSA } from './command-fsa/command-fsa.entity';
import { CommandWithGivenTypeNotFoundExceptionFilter } from './exception-handling/exception-filters/command-with-given-type-not-found.filter';
import { NoCommandHandlerForCommandTypeFilter } from './exception-handling/exception-filters/no-command-handler-for-command-type.filter';

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
 *
 * We might want to use returned errors intead of throwing in these situations.
 */
@UseFilters(new CommandWithGivenTypeNotFoundExceptionFilter())
@UseFilters(new NoCommandHandlerForCommandTypeFilter())
export class CommandController {
    private readonly commandResultSubject = new Subject<MessageEvent>();

    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(BULK_JOB_REPOSITORY_INJECTION_TOKEN)
        private readonly bulkJobRepo: IBulkJobRepository,
        @Inject(ID_MANAGER_TOKEN)
        private readonly idManager: IIdManager,
        private readonly commandExecutor: CommandExecutionService
    ) {}

    // @ApiBearerAuth('JWT')
    // @UseGuards(AdminJwtGuard)
    @Post('')
    async executeCommand(@Request() req, @Res() res, @Body() commandFSA: CommandFSA) {
        // const { user } = req;

        const dummyAdminUser = buildTestData().user[0].clone({
            id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b110003',
            authProviderUserId: 'auth0|6494fe42ca274491fc92f73e',
            roles: [CoscradUserRole.projectAdmin],
        });

        // Only the role matters here
        const user = new CoscradUserWithGroups(dummyAdminUser, []);

        /**
         * Note that we defer command type validation to the command handler.
         * This is because we want to keep the controller free of domain
         * logic. If we want to drive commands via a CLI, it shouldn't need
         * to know about http.
         */
        const { type, payload, meta } = commandFSA;

        const { contributorIds } = meta || { contributorIds: [] };

        const result = await this.commandExecutor.executeCommand(user, {
            type,
            payload,
            meta: { contributorIds },
        });

        // TODO use response mapping
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

        return res.status(httpStatusCodes.ok).send('Ack');
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('bulk')
    async createBulkJob(
        @Res() res,
        // TODO pipe validation?
        @Body() createDto: any
    ) {
        const result = await this.commandExecutor.createBulkJob(createDto);

        // TODO response mapping
        if (isInternalError(result)) {
            return res.status(HttpStatusCode.badRequest).send(result);
        }

        return res.status(HttpStatusCode.ok).send({ id: result });
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('bulk/:id')
    async fetchBulkJobById(@Res() res, @Param('id') id: string) {
        const searchResult = await this.commandExecutor.fetchBulkJobById(id);

        // TODO response mapping
        if (isNotFound(searchResult)) {
            return res.status(HttpStatusCode.notFound).send();
        }

        return res.status(HttpStatusCode.ok).send(searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('bulk')
    // TODO support filters
    async fetchManyBulkJobs(@Res() res) {
        const searchResult = await this.commandExecutor.fetchManyBulkJobs();

        return res.status(HttpStatusCode.ok).send(searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('bulk/:id')
    async executeBulkJob(@Request() req, @Res() res, @Param('id') id: string) {
        const { user } = req;

        const results = await this.commandExecutor.executeBulkJob(user, id);

        if (isInternalError(results)) {
            return res.status(HttpStatusCode.badRequest).send({
                results: results,
            });
        }

        if (
            results.some(
                (singleCommandResultRecord) =>
                    singleCommandResultRecord.result !== COMMAND_ACKNOWLEDGEMENT_BODY_TEXT
            )
        ) {
            return res.status(httpStatusCodes.badRequest).send({
                results,
            });
        }

        return res.status(httpStatusCodes.ok).send({
            results,
        });
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('validate')
    validateCommandTypes(@Res() res, @Body() { stream: commandStream }: { stream: CommandFSA[] }) {
        const validationResults = this.commandExecutor.validateCommandStream(commandStream);

        if (isInternalError(validationResults)) {
            return res
                .status(HttpStatusCode.badRequest)
                .send({ message: validationResults.toString() });
        }

        if (validationResults.some(({ result }) => result !== COMMAND_ACKNOWLEDGEMENT_BODY_TEXT)) {
            return res.status(HttpStatusCode.badRequest).send({
                results: validationResults,
            });
        }

        return res.status(HttpStatusCode.ok).send({
            results: validationResults,
        });
    }

    @Sse('notifications')
    commandSuccessNotifications(): Observable<MessageEvent> {
        return this.commandResultSubject.asObservable();
    }
}
