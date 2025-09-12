import { AggregateType, CoscradUserRole } from '@coscrad/api-interfaces';
import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { CoscradBulkImportJobCreateDto } from '../app/controllers/command/bulk-imports/bulk-import-job.create-dto.entity';
import { CommandExecutionService } from '../app/controllers/command/command-execution.service';
import { CoscradInvalidUserInputException } from '../app/controllers/response-mapping/CoscradExceptions';
import validateSimpleInvariants from '../domain/domainModelValidators/utilities/validateSimpleInvariants';
import { CoscradUserWithGroups } from '../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { AggregateId } from '../domain/types/AggregateId';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { isNotFound } from '../lib/types/not-found';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

type DataFileNameAndBulkJob = {
    filename: string;
    bulkJob: CoscradBulkImportJobCreateDto;
};

interface ManageBulkJobsCliCommandOptions {
    dataFile: DataFileNameAndBulkJob;
    infoFor: AggregateId;
}

@CliCommand({
    name: 'manage-bulk-jobs',
    description: 'create, execute, and review results of bulk import jobs',
})
export class ManageBulkJobsCliCommand extends CliCommandRunner {
    constructor(
        private readonly commandExecutor: CommandExecutionService,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(_passedParams: string[], options: ManageBulkJobsCliCommandOptions): Promise<void> {
        const { dataFile, infoFor: bulkJobIdForQuery } = options;

        if (!isNullOrUndefined(dataFile) && !isNullOrUndefined(bulkJobIdForQuery)) {
            throw new InternalError(`only one of **data-file** and **info-for** may be specified`);
        }

        if (isNullOrUndefined(dataFile) && isNullOrUndefined(bulkJobIdForQuery)) {
            throw new InternalError(
                `you must specify one and only one of **data-file** and **info-for**`
            );
        }

        if (!isNullOrUndefined(dataFile)) {
            await this.executeBulkJob({ dataFile });
        }

        if (!isNullOrUndefined(bulkJobIdForQuery)) {
            await this.fetchBulkJobById(bulkJobIdForQuery);
        }
    }

    private async executeBulkJob({ dataFile }: Pick<ManageBulkJobsCliCommandOptions, 'dataFile'>) {
        const { bulkJob, filename } = dataFile;

        const uuidAcquisitionResult = await this.commandExecutor.acquireIdsForSlugsOnStream(
            bulkJob.stream.map((fsa) => ({
                ...fsa,
                meta: {
                    userId: 'COSCRAD Admin',
                    /**
                     * This allows the user to inject `contributorIds`. We do not
                     * want the user to override timestamps, though.
                     */
                    contributorIds: fsa.meta?.contributorIds || [],
                },
            }))
        );

        if (isInternalError(uuidAcquisitionResult)) {
            this.logger.log(uuidAcquisitionResult.toString());

            throw uuidAcquisitionResult;
        }

        const { updatedStream: streamWithUuidsInPlaceOfSlugs } = uuidAcquisitionResult;

        const validationResult = this.commandExecutor.validateCommandStream(
            streamWithUuidsInPlaceOfSlugs
        );

        if (isInternalError(validationResult)) {
            const e = new InternalError(`Failed to schedule bulk job with schema errors`, [
                validationResult,
            ]);

            this.logger.log(e.message);

            throw e;
        }

        const jobCreationResult = await this.commandExecutor.createBulkJob({
            ...bulkJob,
            stream: streamWithUuidsInPlaceOfSlugs,
        });

        if (isInternalError(jobCreationResult)) {
            const e = new InternalError(`failed to create bulk job with name: ${bulkJob.name}`);

            this.logger.log(e.message);

            throw e;
        }

        const jobId = jobCreationResult;

        await this.commandExecutor.executeBulkJob(
            new CoscradUserWithGroups(
                new CoscradUser({
                    type: AggregateType.user,
                    username: 'coscrad-admin',
                    id: 'COSCRAD_ADMIN',
                    authProviderUserId: '',

                    roles: [CoscradUserRole.superAdmin],
                    profile: {
                        name: {
                            firstName: 'CLI',
                            lastName: 'User',
                        },
                        email: 'cli-user@cosrad.org',
                    },
                }),
                []
            ),
            jobId
        );

        const result = await this.commandExecutor.fetchBulkJobById(jobId);

        if (isNotFound(result)) {
            const e = new InternalError(`bulk job: ${jobId} went missing during execution`);

            this.logger.log(e.message);

            throw e;
        }

        const resultFilepath = `${filename}.log.data.json`;

        writeFileSync(resultFilepath, JSON.stringify(result, null, 4));

        const bulkJobDescriptionForLog = `Bulk job: ${bulkJob.name} (${jobId})`;

        if (!result.didSucceed) {
            const e = new InternalError(
                `${bulkJobDescriptionForLog} failed. See errors in log file: ${resultFilepath}`
            );

            this.logger.log(e.message);

            throw e;
        }

        this.logger.log(`${bulkJobDescriptionForLog} has succeeded.`);
    }

    private async fetchBulkJobById(id: AggregateId) {
        const record = await this.commandExecutor.fetchBulkJobById(id);

        this.logger.log(JSON.stringify(record));
    }

    /**
     * TODO We want to reuse our REST API controllers in which case we will
     * make it easy to generate one CLI Commanad per controller method. It's not ideal
     * to shoehorn 2 method calls into one CLI command, but as long as we are
     * manually creating CLI bindings, we want to keep the number of command classes
     * small.
     */
    @CliCommandOption({
        flags: '--data-file [data-file]',
        description: 'path to the (local) JSON data file with an array of command FSAs',
        // This param must be provided only when `info-for` is not
        required: false,
    })
    parseDataFile(value: string): DataFileNameAndBulkJob {
        if (!isNonEmptyString(value)) return undefined;

        try {
            const parsedBulkJobCreateDto = JSON.parse(
                readFileSync(value, { encoding: 'utf-8' })
            ) as CoscradBulkImportJobCreateDto;

            const dtoSchemaValidationErrors = validateSimpleInvariants(
                // @ts-expect-error The type is too restrictive in the util
                CoscradBulkImportJobCreateDto,
                parsedBulkJobCreateDto
            );

            if (dtoSchemaValidationErrors.length > 0) {
                const e = new CoscradInvalidUserInputException(
                    new InternalError(
                        `Encountered an invalid bulk job import record: ${
                            parsedBulkJobCreateDto?.name || 'unknown name'
                        }.`,
                        dtoSchemaValidationErrors
                    )
                );

                this.logger.log(e.message);

                throw e;
            }

            return { filename: value, bulkJob: parsedBulkJobCreateDto };
        } catch (error) {
            const customError = new InternalError(
                `Failed to parse bulk job from JSON file`,
                error?.message ? [new InternalError(error.message)] : []
            );

            this.logger.log(customError.toString());

            throw customError;
        }
    }

    @CliCommandOption({
        flags: '--info-for [info-for]',
        description: 'Bulk ID job to obtain info for',
        // This param must be provided only when `data-file` is not
        required: false,
    })
    parseInfoFor(value: string): AggregateId {
        if (isNullOrUndefined(value)) {
            return undefined;
        }

        if (!isNonEmptyString(value)) {
            throw new InternalError(`Encountered an invalid ID. Expected non-empty text.`);
        }

        return value;
    }
}
