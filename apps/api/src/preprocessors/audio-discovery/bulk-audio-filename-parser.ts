import { MIMEType } from '@coscrad/api-interfaces';
import { InternalError } from '../../lib/errors/InternalError';
import { IAudioParsingStrategy } from './audio-parsing-strategy.interface';

const getMimeTypeFromExtension = (extension: string): MIMEType | null => {
    const mimeType = MIMEType[extension] || null;

    return mimeType;
};

export type PrefixExtensionAndMimeType = {
    prefix: string;
    extension: keyof typeof MIMEType;
    mimeType: MIMEType;
};

export class BulkAudioFilenameParser {
    constructor(private readonly strategy: IAudioParsingStrategy) {}

    async createCommandStream(
        filename: string
    ): Promise<{ type: string; payload: unknown }[] | Error> {
        const audioFilenameParsingResult = this.parseFilename(filename);

        if (Array.isArray(audioFilenameParsingResult)) {
            return new InternalError(
                `Failed to parse audio filename due to the following errors:`,
                audioFilenameParsingResult
            );
        }

        return this.strategy.createCommandStream(audioFilenameParsingResult);
    }

    // TODO Error handling lib!
    private parseFilename(filename: string): PrefixExtensionAndMimeType | InternalError[] {
        const splitOnDots = filename.split('.');

        if (splitOnDots.length !== 2)
            return [new InternalError(`Only one '.' may appear in a filename`)];

        const [prefix, rawExtension] = splitOnDots;

        const mimeType = getMimeTypeFromExtension(rawExtension);

        if (mimeType === null)
            return [
                new InternalError(`Failed to determine MIME Type from extension: ${rawExtension}`),
            ];

        return {
            prefix,
            extension: rawExtension as keyof typeof MIMEType,
            mimeType,
        };
    }
}
