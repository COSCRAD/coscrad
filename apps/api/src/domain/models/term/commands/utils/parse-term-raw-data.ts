import {
    isNonEmptyObject,
    isNonEmptyString,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { RawDataForTermImports } from './raw-data-for-term-imports.entity';

export interface TermDataLineage {
    possibleAudioFilenames?: string[];
}

export const parseTermRawData = (input: unknown): ResultOrError<TermDataLineage> => {
    if (!isNonEmptyObject(input)) {
        return {};
    }

    /**
     * TODO use class transformer and schema validation
     */
    const { possibleAudioFilenames, audioFilename } = input as RawDataForTermImports;

    const allErrors: InternalError[] = [];

    const result = [];

    if (!isNullOrUndefined(possibleAudioFilenames)) {
        if (
            !Array.isArray(possibleAudioFilenames) ||
            !possibleAudioFilenames.every(isNonEmptyString)
        ) {
            allErrors.push(
                new InternalError(
                    `Invalid value encountered for property 'possibleAudioFilenames. Expected a list of non-empty text.'`
                )
            );
        } else {
            possibleAudioFilenames.forEach((f) => {
                result.push(f);
            });
        }
    }

    if (!isNullOrUndefined(audioFilename)) {
        if (!isNonEmptyString(audioFilename)) {
            allErrors.push(
                new InternalError(
                    `Invalid value discovered for "audioFilename". Expected non-empty text.`
                )
            );
        } else {
            result.push(audioFilename);
        }
    }

    if (allErrors.length > 0) {
        return new InternalError(`Failed to parse raw data for term data lineage`, allErrors);
    }

    return { possibleAudioFilenames: result };
};
