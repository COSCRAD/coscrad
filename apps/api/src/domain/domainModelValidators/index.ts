import { InternalError } from '../../lib/errors/InternalError';
import { ResourceType } from '../types/ResourceType';
import bibliographicReferenceValidator from './bibliographicReferenceValidator';
import bookValidator from './bookValidator';
import mediaItemValidator from './mediaItemValidator';
import photographValidator from './photographValidator';
import songValidator from './songValidator';
import spatialFeatureValidator from './spatialFeatureValidator';
import termValidator from './termValidator';
import transcribedAudioValidator from './transcribedAudioValidator';
import { DomainModelValidator } from './types/DomainModelValidator';
import vocabularyListValidator from './vocabularyListValidator';

// TODO should we put these on the classes and use polymorphism?
export const getValidatorForEntity = (resourceType: ResourceType): DomainModelValidator => {
    switch (resourceType) {
        case ResourceType.term:
            return termValidator;

        case ResourceType.vocabularyList:
            return vocabularyListValidator;

        case ResourceType.transcribedAudio:
            return transcribedAudioValidator;

        case ResourceType.book:
            return bookValidator;

        case ResourceType.photograph:
            return photographValidator;

        case ResourceType.spatialFeature:
            return spatialFeatureValidator;

        case ResourceType.bibliographicReference:
            return bibliographicReferenceValidator;

        case ResourceType.song:
            return songValidator;

        case ResourceType.mediaItem:
            return mediaItemValidator;

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
