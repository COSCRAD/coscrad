import { InternalError } from '../../lib/errors/InternalError';
import { ResourceType, resourceTypes } from '../types/resourceTypes';
import bibliographicReferenceValidator from './bibliographicReferenceValidator';
import bookValidator from './bookValidator';
import photographValidator from './photographValidator';
import spatialFeatureValidator from './spatialFeatureValidator';
import termValidator from './termValidator';
import transcribedAudioValidator from './transcribedAudioValidator';
import { DomainModelValidator } from './types/DomainModelValidator';
import vocabularyListValidator from './vocabularyListValidator';

// TODO should we put these on the classes and use polymorphism?
export const getValidatorForEntity = (resourceType: ResourceType): DomainModelValidator => {
    switch (resourceType) {
        case resourceTypes.term:
            return termValidator;

        case resourceTypes.vocabularyList:
            return vocabularyListValidator;

        case resourceTypes.transcribedAudio:
            return transcribedAudioValidator;

        case resourceTypes.book:
            return bookValidator;

        case resourceTypes.photograph:
            return photographValidator;

        case resourceTypes.spatialFeature:
            return spatialFeatureValidator;

        case resourceTypes.bibliographicReference:
            return bibliographicReferenceValidator;

        default:
            throw new InternalError(
                `Failed to get validator for unknown entity type: ${resourceType}`
            );
    }
};

export default {
    termValidator,
    vocabularyListValidator,
};
