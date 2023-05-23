import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { DataImporter } from '../persistence/repositories/data-importer';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';

@CliCommand({
    name: 'data-restore',
    description: 'restores the database state from a snapshot file',
})
export class DomainRestoreCliCommand extends CliCommandRunner {
    dataImporter: DataImporter;

    constructor(databaseProvider: ArangoDatabaseProvider) {
        super();

        this.dataImporter = new DataImporter(databaseProvider);
    }

    async run(_passedParams: string[], { filepath }: { filepath: string }): Promise<void> {
        return this.dataImporter.import({ filepath });
    }

    @CliCommandOption({
        flags: '-f, --filepath [filepath]',
        description: 'the path to write the output to',
        required: true,
    })
    parseFilepath(value: string): string {
        return value;
    }
}
