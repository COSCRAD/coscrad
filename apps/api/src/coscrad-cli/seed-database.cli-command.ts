import { Inject } from '@nestjs/common';
import { InternalError } from '../lib/errors/InternalError';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

type SeedDatabaseOptions = {
    collectionName: string;
    docs: any[];
};

@CliCommand({
    name: 'seed-database',
    description: 'adds a given array of documents to a database collection by name',
})
export class SeedDatabaseCliCommand extends CliCommandRunner {
    constructor(
        private readonly databaseProvider: ArangoDatabaseProvider,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    @CliCommandOption({
        flags: '--collectionName [collectionName]',
        description: `the name of the collection you are writing to`,
        required: true,
    })
    parseCollectionName(rawValue: string) {
        // todo check length \ allowed list

        return rawValue;
    }

    @CliCommandOption({
        flags: '--docs [docs]',
        description: 'the documents you want to append to the given collection',
        required: true,
    })
    parseDocs(rawValue: string): any[] {
        try {
            const parseResult = JSON.parse(rawValue);

            if (!Array.isArray(parseResult)) {
                // TODO clean up this logic
                // TODO make this a returned error
                throw new InternalError(
                    `failed to parse command fsa from user input, docs: ${rawValue}`
                );
            }

            return parseResult;
        } catch (error) {
            throw new InternalError(
                `failed to parse command fsa from user input, docs: ${rawValue}`
            );
        }
    }

    async run(
        _passedParams: string[],
        { collectionName, docs }: SeedDatabaseOptions
    ): Promise<void> {
        await this.databaseProvider.getDatabaseForCollection(collectionName).createMany(docs);
    }
}
