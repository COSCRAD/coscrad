import { CommandHandlerService } from '@coscrad/commands';
import { getCoscradDataSchema } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { InternalError } from '../lib/errors/InternalError';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';

type ExportSchemasOptions = {
    directory: string;
};

// TODO How does this relate to our types in @coscrad/data-types?
type CoscradDataClassDefinition = {
    name: string;
    type: string;
    meta: unknown;
    // TODO tighten this up
    schema: unknown;
};

@CliCommand({
    name: 'export-schemas',
    description: `export COSCRAD data schemas for domain models, view models, commands, or events`,
})
export class ExportSchemasCliCommand extends CliCommandRunner {
    constructor(private readonly commandHandlerService: CommandHandlerService) {
        super();
    }

    async run(_passedParams: string[], options: ExportSchemasOptions) {
        const allCtors = await this.commandHandlerService.getAllCommandCtorsAndMetadata();

        const nameTypeAndSchemas: CoscradDataClassDefinition[] = allCtors.map(
            ({ constructor, meta }) => ({
                type: 'COMMAND',
                name: constructor.name,
                meta,
                schema: getCoscradDataSchema(constructor),
            })
        );

        const { directory } = options;

        // TODO Inject a file management service instead so we can write to S3 buckets instead of local file system easily
        const commandsFile = `${directory}/command.coscrad-data-schemas.json`;

        if (!existsSync(directory)) {
            mkdirSync(directory, { recursive: true });
        }

        const dataToWrite = JSON.stringify(nameTypeAndSchemas, null, 4);

        writeFileSync(commandsFile, dataToWrite);
    }

    @CliCommandOption({
        flags: '-d, --directory [filepath]',
        name: 'exportDirectory',
        description: 'the directory where the schemas should be written',
        required: true,
    })
    parseDirectory(value: string): string {
        if (!isNonEmptyString(value)) {
            // TODO find a pattern to return these errors
            throw new InternalError(
                `Invalid value received for option --directory, expected a non-empty string`
            );
        }

        return value;
    }
}
