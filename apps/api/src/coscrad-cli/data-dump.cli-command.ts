import { writeFileSync } from 'fs';
import { ArangoDataExporter } from '../persistence/repositories/arango-data-exporter';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';

@CliCommand({
    name: 'data-dump',
    description: 'dumps the database state to a snapshot file',
})
export class DomainDumpCliCommand extends CliCommandRunner {
    constructor(private readonly arangoDataExporter: ArangoDataExporter) {
        super();
    }

    async run(_passedParams: string[], options?: { filepath: string }): Promise<void> {
        const NUMBER_OF_SPACES_TO_INDENT = 4;

        const snapshotInDatabaseFormat = await this.arangoDataExporter.fetchSnapshot();

        writeFileSync(
            options.filepath,
            JSON.stringify(snapshotInDatabaseFormat, null, NUMBER_OF_SPACES_TO_INDENT)
        );
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
