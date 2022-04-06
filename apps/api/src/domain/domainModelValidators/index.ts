import { InternalError } from '../../lib/errors/InternalError';
import { EntityType, entityTypes } from '../types/entityTypes';
import audioWithTranscriptValidator from './audioWithTranscriptValidator';
import bookValidator from './bookValidator';
import photographValidator from './photographValidator';
import tagValidator from './tagValidator';
import termValidator from './termValidator';
import { DomainModelValidator } from './types/DomainModelValidator';
import vocabularyListValidator from './vocabularyListValidator';

// TODO should we put these on the classes and use polymorphism?
export const getValidatorForEntity = (entityType: EntityType): DomainModelValidator => {
    switch (entityType) {
        case entityTypes.tag:
            return tagValidator;

        case entityTypes.term:
            return termValidator;

        case entityTypes.vocabularyList:
            return vocabularyListValidator;

        case entityTypes.audioWithTranscript:
            return audioWithTranscriptValidator;

        case entityTypes.book:
            return bookValidator;

        case entityTypes.photograph:
            return photographValidator;

        default:
            throw new InternalError(
                `Failed to get validator for unknown entity type: ${entityType}`
            );
    }
};

export default {
    termValidator,
    vocabularyListValidator,
};
