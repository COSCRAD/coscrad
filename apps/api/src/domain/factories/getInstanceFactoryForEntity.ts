import { InternalError } from '../../lib/errors/InternalError';
import { ResultOrError } from '../../types/ResultOrError';
import bookValidator from '../domainModelValidators/bookValidator';
import photographValidator from '../domainModelValidators/photographValidator';
import tagValidator from '../domainModelValidators/tagValidator';
import termValidator from '../domainModelValidators/termValidator';
import transcribedAudioValidator from '../domainModelValidators/transcribedAudioValidator';
import vocabularyListValidator from '../domainModelValidators/vocabularyListValidator';
import { Book } from '../models/book/entities/book.entity';
import { Photograph } from '../models/photograph/entities/photograph.entity';
import { Resource } from '../models/resource.entity';
import { Tag } from '../models/tag/tag.entity';
import { Term } from '../models/term/entities/term.entity';
import { TranscribedAudio } from '../models/transcribed-audio/entities/transcribed-audio.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';
import { ResourceType, resourceTypes } from '../types/resourceTypes';
import buildSpatialFeatureFactory from './complexFactories/buildSpatialFeatureFactory';
import buildInstanceFactory from './utilities/buildInstanceFactory';

export type InstanceFactory<TResourceType> = (dto: unknown) => ResultOrError<TResourceType>;

/**
 * It would be nice to find a pattern that gives us better type safety.
 */
export default <TResource extends Resource>(
    resourceType: ResourceType
): InstanceFactory<TResource> => {
    switch (resourceType) {
        case resourceTypes.term:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Term>(termValidator, Term);

        case resourceTypes.vocabularyList:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<VocabularyList>(vocabularyListValidator, VocabularyList);

        case resourceTypes.tag:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Tag>(tagValidator, Tag);

        case resourceTypes.transcribedAudio:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<TranscribedAudio>(
                transcribedAudioValidator,
                TranscribedAudio
            );

        case resourceTypes.book:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Book>(bookValidator, Book);

        case resourceTypes.photograph:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Photograph>(photographValidator, Photograph);

        case resourceTypes.spatialFeature:
            // @ts-expect-error TODO fix this tricky type error
            return buildSpatialFeatureFactory();

        default:
            throw new InternalError(
                `Failed to build instance factory for unknown entity type ${resourceType}`
            );
    }
};
