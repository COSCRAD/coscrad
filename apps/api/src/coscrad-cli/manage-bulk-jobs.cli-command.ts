import { AggregateType, CoscradUserRole } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { CoscradBulkImportJobCreateDto } from '../app/controllers/command/bulk-imports/bulk-import-job.create-dto.entity';
import { CommandExecutionService } from '../app/controllers/command/command-execution.service';
import { CoscradInvalidUserInputException } from '../app/controllers/response-mapping/CoscradExceptions';
import validateSimpleInvariants from '../domain/domainModelValidators/utilities/validateSimpleInvariants';
import { CoscradUserWithGroups } from '../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../domain/models/user-management/user/entities/user/coscrad-user.entity';
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

    async run(
        _passedParams: string[],
        { dataFile: { bulkJob, filename } }: ManageBulkJobsCliCommandOptions
    ): Promise<void> {
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

        const resultFilepath = `${filename}.log.json`;

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

    @CliCommandOption({
        flags: '--data-file [data-file]',
        description: 'path to the (local) JSON data file with an array of command FSAs',
        required: true,
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
}
