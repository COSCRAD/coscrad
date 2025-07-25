import { Ack, CommandHandlerService, CommandStreamExecutionResult } from '@coscrad/commands';
import { isNonEmptyObject, isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
    UniquelyIdentifiableType,
} from '../../../domain/interfaces/id-manager.interface';
import validateCommandPayloadType from '../../../domain/models/shared/command-handlers/utilities/validateCommandPayloadType';
import CommandExecutionError from '../../../domain/models/shared/common-command-errors/CommandExecutionError';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../domain/types/AggregateId';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { ResultOrError } from '../../../types/ResultOrError';
import { CoscradBulkImportJobCreateDto } from './bulk-imports/bulk-import-job.create-dto.entity';
import { CoscradBulkImportJob } from './bulk-imports/bulk-import-job.entity';
import {
    BULK_JOB_REPOSITORY_INJECTION_TOKEN,
    IBulkJobRepository,
} from './bulk-imports/bulk-job-repository.interface';
import { CommandFSA } from './command-fsa/command-fsa.entity';

export const COMMAND_ACKNOWLEDGEMENT_BODY_TEXT = 'ACK';

type CommandStreamExecutionPersistenceRecord = Pick<CommandStreamExecutionResult, 'fsa'> & {
    result: typeof COMMAND_ACKNOWLEDGEMENT_BODY_TEXT | string;
};

// BulkJob Manager?
export class CommandExecutionService {
    constructor(
        private readonly commandHandlerService: CommandHandlerService,
        @Inject(BULK_JOB_REPOSITORY_INJECTION_TOKEN)
        private readonly bulkJobRepo: IBulkJobRepository,
        @Inject(ID_MANAGER_TOKEN)
        private readonly idManager: IIdManager
    ) {}
    async executeCommand(
        user: CoscradUserWithGroups,
        { type, payload, meta }: CommandFSA
    ): Promise<Ack | Error> {
        const result = await this.commandHandlerService.execute(
            { type, payload },
            {
                ...meta,
                userId: user.id,
            }
        );

        return result instanceof Error
            ? new CommandExecutionError([new InternalError(result.message)])
            : result;
    }

    async createBulkJob(
        createDto: CoscradBulkImportJobCreateDto
    ): Promise<ResultOrError<AggregateId>> {
        // TODO invariant validation

        const newId = await this.idManager.generate();

        const instanceOrError = CoscradBulkImportJob.fromCreateDto({ ...createDto, id: newId });

        if (isInternalError(instanceOrError)) {
            return instanceOrError;
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

        return result;
    }

    async fetchBulkJobById(jobId: AggregateId): Promise<Maybe<CoscradBulkImportJob>> {
        return this.bulkJobRepo.fetchById(jobId);
    }

    async fetchManyBulkJobs(): Promise<CoscradBulkImportJob[]> {
        return this.bulkJobRepo.fetchMany();
    }

    async executeBulkJob(
        user: CoscradUserWithGroups,
        id: string
    ): Promise<ResultOrError<CommandStreamExecutionPersistenceRecord[]>> {
        const fetchResult = await this.bulkJobRepo.fetchById(id);

        if (isNotFound(fetchResult)) {
            return new InternalError(`There is no bulk job with the ID: ${id}`);
        }

        if (!fetchResult.isDraft()) {
            return new InternalError(
                `You cannot execute bulk job: ${id} as it has already been initiated`
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

        const results = this.transformResults(resultsForAllCommands);

        // @ts-expect-error fix this
        await this.bulkJobRepo.registerResults(id, results, Date.now());

        return results;
    }

    validateCommandStream(
        commandStream: CommandFSA[]
    ): ResultOrError<CommandStreamExecutionPersistenceRecord[]> {
        if (!(commandStream.length > 0)) {
            return new InternalError(`You must provide at least one command FSA to validate`);
        }

        // @ts-expect-error TODO fix this
        const validationResults: CommandStreamExecutionResult[] = commandStream.map(
            (fsa, index) => {
                // TODO use schema validation for this
                if (!isNonEmptyString(fsa.type)) {
                    return {
                        fsa,
                        result: new InternalError(
                            `You must specify the type of command to execute`
                        ),
                    };
                }

                // TODO allow both payload and type errors to come through for easier troubleshooting
                if (!isNonEmptyObject(fsa.payload)) {
                    return {
                        fsa,
                        result: new InternalError(
                            `You must provide a payload for ${fsa.type ? fsa.type : 'this command'}`
                        ),
                    };
                }

                const commandBuildResult = this.commandHandlerService.buildCommandInstance(fsa);

                const result =
                    // be careful, the command handler service does not package errors inside of `InternalError`
                    commandBuildResult instanceof Error
                        ? new InternalError(
                              `Encountered an invalid command stream at index [${index}]`,
                              [new InternalError(commandBuildResult.message)]
                          )
                        : validateCommandPayloadType(commandBuildResult, fsa.type);

                return {
                    fsa,
                    result,
                };
            }
        );

        return this.transformResults(validationResults);
    }

    private transformResults(
        results: CommandStreamExecutionResult[]
    ): CommandStreamExecutionPersistenceRecord[] {
        return results.map(({ fsa, result }) => {
            return {
                fsa,
                result:
                    result instanceof Error ? result.toString() : COMMAND_ACKNOWLEDGEMENT_BODY_TEXT,
            };
        });
    }
}
