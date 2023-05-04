import { Command, CommandRunner, Option } from 'nest-commander';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { DataImporter } from '../persistence/repositories/data-importer';

@Command({
    name: 'data-restore',
    description: 'restores the database state from a snapshot file',
})
export class DomainRestoreCliCommand extends CommandRunner {
    dataImporter: DataImporter;

    constructor(databaseProvider: ArangoDatabaseProvider) {
        super();

        this.dataImporter = new DataImporter(databaseProvider);
    }

    async run(_passedParams: string[], { filepath }: { filepath: string }): Promise<void> {
        return this.dataImporter.restore({ filepath });
    }

    @Option({
        flags: '-f, --filepath [filepath]',
        description: 'the path to write the output to',
        required: true,
    })
    parseFilepath(value: string): string {
        return value;
    }
}
