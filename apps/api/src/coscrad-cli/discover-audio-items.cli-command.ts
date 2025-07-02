import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';

@CliCommand({
    name: 'discover-audio-for-terms',
    description: 'export a json file identifying possible audio items for each term without audio',
})
export class DiscoverAudioItemsCliCommand extends CliCommandRunner {
    async run(_passedParams: string[], _options?: Record<string, any>): Promise<void> {
        throw new Error('Method not implemented.');
    }

    @CliCommandOption({
        flags: '-f, --filepath [filepath]',
        description: 'the path to the desired output file',
        required: true,
    })
    parseFilepath(value: string): string {
        // if(existsSync(value)){
        //     throw new InternalError(`Cannot overwrite file: ${value}`)
        // }

        // TODO  non-empty string? dir exists?

        return value;
    }
}
