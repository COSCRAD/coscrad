import { InternalError } from '../../lib/errors/InternalError';
import { EntityType, entityTypes } from '../types/entityTypes';
import bookValidator from './bookValidator';
import photographValidator from './photographValidator';
import spatialFeatureValidator from './spatialFeatureValidator';
import tagValidator from './tagValidator';
import termValidator from './termValidator';
import transcribedAudioValidator from './transcribedAudioValidator';
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

        case entityTypes.transcribedAudio:
            return transcribedAudioValidator;

        case entityTypes.book:
            return bookValidator;

        case entityTypes.photograph:
            return photographValidator;

        case entityTypes.spatialFeature:
            return spatialFeatureValidator;

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
