import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { RawDataForTermImports } from './raw-data-for-term-imports.entity';

export interface TermDataLineage {
    possibleAudioFilenames?: string[];
}

export const parseTermRawData = (input: unknown): ResultOrError<TermDataLineage> => {
    /**
     * TODO use class transformer and schema validation
     */
    const { possibleAudioFilenames, audioFilename } = input as RawDataForTermImports;

    const allErrors: InternalError[] = [];

    const result = isNullOrUndefined(possibleAudioFilenames)
        ? []
        : // shallow-clone to avoid modifying the input (strings are primitives)
          possibleAudioFilenames.map((f) => f);

    if (!Array.isArray(result) || !result.every(isNonEmptyString)) {
        allErrors.push(
            new InternalError(
                `Invalid value discovered for "possibleAudioFilenames". Expected a list of non-empty text.`
            )
        );
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
