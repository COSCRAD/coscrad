import { writeFileSync } from 'fs';
import { ArangoEdgeCollectionId } from '../persistence/database/collection-references/ArangoEdgeCollectionId';
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

        /**
         * Unfortunately, ArangoJS doesn't expose a good way to iterate over
         * **only** edge collections (at least when connected as a non-admin).
         * In order to keep the edge collections separate (required to be
         * able to recreate the given collections on restore), we have to
         * pass these in manually.
         */
        const knownEdgeCollections = [...Object.values(ArangoEdgeCollectionId)];

        const snapshotInDatabaseFormat = await this.arangoDataExporter.fetchSnapshot(
            knownEdgeCollections
        );

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
