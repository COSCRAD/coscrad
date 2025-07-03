import { LanguageCode } from '@coscrad/api-interfaces';
import { isBoolean } from '@coscrad/validation-constraints';
import { writeFileSync } from 'fs';
import { TermQueryService } from '../domain/services/query-services/term-query.service';
import { InternalError } from '../lib/errors/InternalError';
import { CliCommand, CliCommandOption, CliCommandRunner } from './cli-command.decorator';

interface DiscoverAudioItemsCliCommandOptions {
    filepath: string;
    languageCode: LanguageCode;
    publish: boolean;
}

@CliCommand({
    name: 'discover-audio-for-terms',
    description: 'export a json file identifying possible audio items for each term without audio',
})
export class DiscoverAudioItemsCliCommand extends CliCommandRunner {
    constructor(private readonly termQueryService: TermQueryService) {
        super();
    }

    async run(
        _passedParams: string[],
        {
            filepath,
            languageCode: languageCodeForAudio,
            publish: shouldPublishTerms,
        }: DiscoverAudioItemsCliCommandOptions
    ): Promise<void> {
        const audioForTerms = await this.termQueryService.discoverAudio({
            languageCodeForAudio,
            // TODO CLI optoin
            shouldPublishTerms,
        });

        // TODO add time stamp
        writeFileSync(
            filepath,

            JSON.stringify(audioForTerms, null, 4)
        );
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

    @CliCommandOption({
        flags: '-l, --languageCode [languageCode]',
        description: 'the language of the audio',
        required: true,
    })
    parseLanguageCode(value: string): LanguageCode {
        const test = value as LanguageCode;

        if (Object.values(LanguageCode).includes(test)) {
            return test;
        }

        throw new InternalError(
            `Encountered an invalid language code {${value}} when discovering audio for terms`
        );
    }

    @CliCommandOption({
        flags: '-p, --publish [publish]',
        description: 'should the term be published?',
        required: false,
    })
    parsePublish(value: string): boolean {
        const result = JSON.parse(value);

        if (isBoolean(result)) return result;

        // default
        return false;
    }
}
