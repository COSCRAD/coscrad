import { Inject } from '@nestjs/common';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { IRepositoryProvider } from '../domain/repositories/interfaces/repository-provider.interface';
import { TermQueryService } from '../domain/services/query-services/term-query.service';
import { InternalError, isInternalError } from '../lib/errors/InternalError';
import { isNotFound } from '../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

type Options = {
    exportPath: string;
    resultsPage: number;
};

@CliCommand({
    name: 'export-terms',
    description: `export all terms`,
})
/**
 * This particular command is helpful when we want to generate a
 * PDF of terms for a printable glossary
 */
export class ExportTermsCliCommand extends CliCommandRunner {
    constructor(
        private readonly termsQueryService: TermQueryService,
        @Inject(REPOSITORY_PROVIDER_TOKEN) private readonly repositoryProvider: IRepositoryProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run(_passedParams: string[], { exportPath, resultsPage }: Options): Promise<void> {
        if (!existsSync(exportPath)) mkdirSync(exportPath);

        console.log(`ExportTermsCliCommand: Results Page: ${resultsPage}`);

        const termQueryResults = await this.termsQueryService.fetchMany(undefined, {
            filter: undefined,
            pagination: {
                size: 1000,
                page: Number(resultsPage),
            },
        });

        if (isNotFound(termQueryResults)) return;

        if (isInternalError(termQueryResults)) return;

        const { entities: allTermEntities, count } = termQueryResults;

        if (count === 0) {
            this.logger.log(`No terms found.`);

            return;
        }

        console.log(`Returned term results: ${count}`);

        const contributors = await this.repositoryProvider.getContributorRepository().fetchMany();

        if (!Array.isArray(contributors)) {
            this.logger.log(`No contributors found in system.`);

            return;
        }

        const contributorsSimple = contributors.map((contributor) => {
            if (isInternalError(contributor)) return;

            return {
                id: contributor.id,
                fullName: contributor.fullName,
            };
        });

        const termsWithContributors = allTermEntities.reduce(
            (acc, { id: termId, name, contributions, notes }) => {
                const contributorIds = contributions
                    .filter(({ type }) => type === 'TERM_CREATED')
                    .flatMap(({ contributorIds }) => contributorIds)
                    .map((id) => id);

                const contributorsForTerm = contributorIds.reduce((acc, id) => {
                    const new_cont = contributorsSimple.filter(
                        ({ id: contributorId }) => contributorId === id
                    );

                    return new_cont.length < 0 ? acc : acc.concat(new_cont);
                }, []);

                return contributorsForTerm.length < 0
                    ? acc
                    : acc.concat({
                          id: termId,
                          name: name,
                          contributors: contributorsForTerm,
                          notes: notes,
                      });
            },
            []
        );

        const termsWithContributorsAndCount = {
            termsWithContributors: termsWithContributors,
            count: count,
        };

        this.logger.log(`Attempting to export terms to: ${exportPath}`);

        const fullFilePath = `${exportPath}term-results-page-${resultsPage}.data.json`;

        this.logger.log(`Path for this batch of terms: ${fullFilePath}`);

        if (existsSync(fullFilePath)) {
            const error = new InternalError(`cannot overwrite existing directory: ${exportPath}`);

            this.logger.log(error.toString());

            throw error;
        }

        this.logger.log(`Writing term results page number ${resultsPage}`);

        /**
         * We want to handle this in a more performant way. It is likely that
         * we will move to another language \ run time for media and binary
         * file management in the near future. If not, we should optimize this
         * code.
         */
        writeFileSync(
            // TODO Use the name here
            fullFilePath,
            JSON.stringify(termsWithContributorsAndCount, undefined, 4)
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

    @CliCommandOption({
        flags: '-p, --resultsPage [resultsPage]',
        description: 'the page of paginated results of max 1000 terms',
        required: true,
    })
    parseResultsPage(input: string) {
        // TODO Validate path existence here
        return input;
    }
}
