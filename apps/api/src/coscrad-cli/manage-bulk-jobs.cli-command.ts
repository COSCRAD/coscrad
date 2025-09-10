import { AggregateType, CoscradUserRole } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Inject } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'fs';
import { CoscradBulkImportJobCreateDto } from '../app/controllers/command/bulk-imports/bulk-import-job.create-dto.entity';
import { CommandExecutionService } from '../app/controllers/command/command-execution.service';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { CoscradUserWithGroups } from '../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { isNotFound } from '../lib/types/not-found';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';
import path = require('path');

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
        @Inject(ID_MANAGER_TOKEN) private readonly idManager: IIdManager,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(
        passedParams: string[],
        { dataFile: { bulkJob, filename } }: ManageBulkJobsCliCommandOptions
    ): Promise<void> {
        const jobCreationResult = await this.commandExecutor.createBulkJob(bulkJob);

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

        const resultFilepath = path.join(filename, '.log.json');

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
        required: false,
    })
    parseDataFile(value: string): DataFileNameAndBulkJob {
        if (!isNonEmptyString(value)) return undefined;

        try {
            const parsedBulkJobCreateDto = JSON.parse(
                readFileSync(value, { encoding: 'utf-8' })
            ) as CoscradBulkImportJobCreateDto;

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
