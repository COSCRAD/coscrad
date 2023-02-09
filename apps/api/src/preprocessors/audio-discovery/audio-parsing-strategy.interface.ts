import { PrefixExtensionAndMimeType } from './bulk-audio-filename-parser';

export interface IAudioParsingStrategy {
    createCommandStream(
        fileNameDetails: PrefixExtensionAndMimeType
    ): Promise<{ type: string; payload: unknown }[]>;
}
