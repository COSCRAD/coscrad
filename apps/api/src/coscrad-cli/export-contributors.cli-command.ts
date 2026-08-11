import { Inject } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { IRepositoryProvider } from '../domain/repositories/interfaces/repository-provider.interface';
import { isInternalError } from '../lib/errors/InternalError';
import { isNotFound } from '../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

type Options = {
    exportPath: string;
};

@CliCommand({
    name: 'export-contributors',
    description: `export all contributors`,
})
/**
 * This command is for checking whether a contributor already exists in the
 * DB for the python notebook scripts
 */
export class ExportContributorsCliCommand extends CliCommandRunner {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) private readonly repositoryProvider: IRepositoryProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(_passedParams: string[], { exportPath }: Options): Promise<void> {
        if (!existsSync(exportPath)) mkdirSync(exportPath);

        console.log(`ExportContributorsCliCommand: exportPath: ${exportPath}`);

        const contributorQueryResults = await this.repositoryProvider
            .getContributorRepository()
            .fetchMany();

        if (isNotFound(contributorQueryResults)) return;

        if (isInternalError(contributorQueryResults)) return;

        if (!Array.isArray(contributorQueryResults)) {
            this.logger.log(`No contributors found in system.`);

            return;
        }

        const contributorsSimple = contributorQueryResults.map((contributor) => {
            if (isInternalError(contributor)) return;

            return {
                id: contributor.id,
                fullName: contributor.fullName,
            };
        });

        const fullFilePath = `${exportPath}contributors.data.json`;

        this.logger.log(`Attempting to export contributors to: ${fullFilePath}`);

        /**
         * We want to handle this in a more performant way. It is likely that
         * we will move to another language \ run time for media and binary
         * file management in the near future. If not, we should optimize this
         * code.
         */
        writeFileSync(
            // TODO Use the name here
            fullFilePath,
            JSON.stringify(contributorsSimple, undefined, 4)
        );
    }

    @CliCommandOption({
        flags: '-e, --exportPath [exportPath]',
        description: 'the path for a new directory to hold the exported data',
        required: true,
    })
    parseExportPath(input: string) {
        // TODO Validate path existence here
        return input;
    }
}
