import { isNonEmptyString } from '@coscrad/validation-constraints';
import { DTO } from '../../../../../types/DTO';

export class RawDataForTermImports {
    possibleAudioFilenames: string[];

    audioFilename: string;

    constructor({ possibleAudioFilenames, audioFilename }: DTO<RawDataForTermImports>) {
        this.possibleAudioFilenames = possibleAudioFilenames;

        this.audioFilename = audioFilename;
    }

    public parse() {
        const result = Array.isArray(this.possibleAudioFilenames)
            ? this.possibleAudioFilenames
            : [];

        if (isNonEmptyString(this.audioFilename)) {
            result.push(this.audioFilename);
        }

        return {
            possibleAudioFilenames: result,
        };
    }
}
