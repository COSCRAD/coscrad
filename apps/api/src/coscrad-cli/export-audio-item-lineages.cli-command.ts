import { writeFileSync } from 'fs';
import { AudioItemQueryService } from '../domain/services/query-services/audio-item-query.service';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';

type Options = {
    filepath: string;
};

@CliCommand({
    name: 'audio-lineages',
    description: 'export a text file that reports media item file names against audio item IDs',
})
export class ExportAudioItemLineagesCliCommand extends CliCommandRunner {
    constructor(private readonly queryService: AudioItemQueryService) {
        super();
    }

    async run(_passedParams: string[], { filepath }: Options) {
        const lineages = await this.queryService.getMediaLineage();

        // TODO add time stamp
        writeFileSync(
            filepath,

            JSON.stringify(lineages, null, 4)
        );
    }

    @CliCommandOption({
        flags: '-f, --filepath [filepath]',
        description: 'the desired path to the output file',
        required: true,
    })
    parseFilepath(value: string): string {
        return value;
    }
}
