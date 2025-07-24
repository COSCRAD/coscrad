import { AGGREGATE_COMPOSITE_IDENTIFIER, HttpStatusCode } from '@coscrad/api-interfaces';
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
    UnauthorizedException,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import validateCommandPayloadType from 'apps/api/src/domain/models/shared/command-handlers/utilities/validateCommandPayloadType';
import { Observable, Subject } from 'rxjs';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
    UniquelyIdentifiableType,
} from '../../../domain/interfaces/id-manager.interface';
import CommandExecutionError from '../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { isNotFound } from '../../../lib/types/not-found';
import httpStatusCodes from '../../constants/httpStatusCodes';
import sendInternalResultAsHttpResponse from '../resources/common/sendInternalResultAsHttpResponse';
import { CoscradBulkImportJobCreateDto } from './bulk-imports/bulk-import-job.create-dto.entity';
import { CoscradBulkImportJob } from './bulk-imports/bulk-import-job.entity';
import {
    BULK_JOB_REPOSITORY_INJECTION_TOKEN,
    IBulkJobRepository,
} from './bulk-imports/bulk-job-repository.interface';
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

    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(BULK_JOB_REPOSITORY_INJECTION_TOKEN)
        private readonly bulkJobRepo: IBulkJobRepository,
        @Inject(ID_MANAGER_TOKEN)
        private readonly idManager: IIdManager
    ) {}

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
    async createBulkJob(
        @Request() req,
        @Res() res,
        // TODO pipe validation?
        @Body() createDto: CoscradBulkImportJobCreateDto
    ) {
        const { user } = req;

        if (!user || !(user instanceof CoscradUserWithGroups)) {
            throw new UnauthorizedException();
        }

        if (!user.isAdmin()) {
            throw new UnauthorizedException();
        }

        // TODO invariant validation

        const newId = await this.idManager.generate();

        const instanceOrError = CoscradBulkImportJob.fromCreateDto({ ...createDto, id: newId });

        if (isInternalError(instanceOrError)) {
            // TODO use response mapping instead
            return res.status(HttpStatusCode.badRequest).send(instanceOrError);
        }

        /**
         * TODO consider wrapping the next 2 repo calls in a transaction. Without
         * doing this, we choose to mark the ID as used as it's better to have
         * an ID that is unavailable but not actually in use than an entity
         * with an ID that is still available. That said, within the normal
         * flow of the situation, UUIDs will be impossible to reuse, but with
         * manual service \ API calls, this situation could be created.
         */
        // TODO Will we track the bulk job as an aggregate root? Maybe we don't need it on the big enum, which is being phased out.
        await this.idManager.use({ type: 'bulkJob' as UniquelyIdentifiableType, id: newId });

        const result = await this.bulkJobRepo.create(instanceOrError);

        return res.status(HttpStatusCode.ok).send({ id: result });
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('bulk/:id')
    async fetchBulkJobById(@Request() req, @Res() res, @Param('id') id: string) {
        const { user } = req;

        if (!user || !(user instanceof CoscradUserWithGroups)) {
            throw new UnauthorizedException();
        }

        if (!user.isAdmin()) {
            throw new UnauthorizedException();
        }

        const searchResult = await this.bulkJobRepo.fetchById(id);

        if (isNotFound(searchResult)) {
            return res.status(HttpStatusCode.notFound).send();
        }

        return res.status(HttpStatusCode.ok).send(searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Get('bulk')
    // TODO support filters
    async fetchManyBulkJobs(@Request() req, @Res() res) {
        const { user } = req;

        if (!user || !(user instanceof CoscradUserWithGroups)) {
            throw new UnauthorizedException();
        }

        if (!user.isAdmin()) {
            throw new UnauthorizedException();
        }

        const searchResult = await this.bulkJobRepo.fetchMany();

        return res.status(HttpStatusCode.ok).send(searchResult);
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('bulk/:id')
    async executeBulkJob(@Request() req, @Res() res, @Param('id') id: string) {
        const { user } = req;

        if (!user || !(user instanceof CoscradUserWithGroups)) {
            throw new UnauthorizedException();
        }

        if (!user.isAdmin()) {
            throw new UnauthorizedException();
        }

        const fetchResult = await this.bulkJobRepo.fetchById(id);

        if (isNotFound(fetchResult)) {
            return res
                .status(HttpStatusCode.notFound)
                .send(new InternalError(`There is no bulk job with the ID: ${id}`))
                .toString();
        }

        if (!fetchResult.isDraft()) {
            return res
                .status(HttpStatusCode.badRequest)
                .send(
                    new InternalError(
                        `You cannot execute bulk job: ${id} as it has already been initiated`
                    )
                );
        }

        const { stream: commandStream } = fetchResult;

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
            const results = resultsForAllCommands.map(({ fsa, result }) => {
                return {
                    fsa,
                    result:
                        result instanceof Error
                            ? result.toString()
                            : COMMAND_ACKNOWLEDGEMENT_BODY_TEXT,
                };
            });

            // @ts-expect-error fix this
            await this.bulkJobRepo.registerResults(id, results, Date.now());

            return res.status(httpStatusCodes.badRequest).send({
                results,
            });
        }

        const results = resultsForAllCommands.map(({ fsa }) => ({
            fsa,
            result: COMMAND_ACKNOWLEDGEMENT_BODY_TEXT,
        }));

        // @ts-expect-error fix this
        await this.bulkJobRepo.registerResults(id, results, Date.now());

        return res.status(httpStatusCodes.ok).send({
            results,
        });
    }

    @ApiBearerAuth('JWT')
    @UseGuards(AdminJwtGuard)
    @Post('bulk')
    validateCommandTypes(@Body() { stream: commandStream }: { stream: CommandFSA[] }) {
        const validationResult = commandStream.map((fsa) => ({
            fsa,
            result: validateCommandPayloadType(fsa.payload, fsa.type),
        }));
    }

    @Sse('notifications')
    commandSuccessNotifications(): Observable<MessageEvent> {
        return this.commandResultSubject.asObservable();
    }
}
