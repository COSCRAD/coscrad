import { InternalError } from '../../lib/errors/InternalError';
import { ResultOrError } from '../../types/ResultOrError';
import bookValidator from '../domainModelValidators/bookValidator';
import mediaItemValidator from '../domainModelValidators/mediaItemValidator';
import photographValidator from '../domainModelValidators/photographValidator';
import songValidator from '../domainModelValidators/songValidator';
import termValidator from '../domainModelValidators/termValidator';
import transcribedAudioValidator from '../domainModelValidators/transcribedAudioValidator';
import vocabularyListValidator from '../domainModelValidators/vocabularyListValidator';
import { Book } from '../models/book/entities/book.entity';
import { MediaItem } from '../models/media-item/entities/media-item.entity';
import { Photograph } from '../models/photograph/entities/photograph.entity';
import { Resource } from '../models/resource.entity';
import { Song } from '../models/song/song.entity';
import { Term } from '../models/term/entities/term.entity';
import { TranscribedAudio } from '../models/transcribed-audio/entities/transcribed-audio.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';
import { ResourceType } from '../types/ResourceType';
import buildBibliographicReferenceFactory from './complexFactories/buildBibliographicReferenceFactory';
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
        case ResourceType.term:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Term>(termValidator, Term);

        case ResourceType.vocabularyList:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<VocabularyList>(vocabularyListValidator, VocabularyList);

        case ResourceType.transcribedAudio:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<TranscribedAudio>(
                transcribedAudioValidator,
                TranscribedAudio
            );

        case ResourceType.book:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Book>(bookValidator, Book);

        case ResourceType.photograph:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Photograph>(photographValidator, Photograph);

        case ResourceType.spatialFeature:
            // @ts-expect-error TODO fix this tricky type error
            return buildSpatialFeatureFactory();

        case ResourceType.bibliographicReference:
            // @ts-expect-error TODO fix this tricky type error

            return buildBibliographicReferenceFactory();

        case ResourceType.song:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Song>(songValidator, Song);

        case ResourceType.mediaItem:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<MediaItem>(mediaItemValidator, MediaItem);

        default:
            throw new InternalError(
                `Failed to build instance factory for unknown entity type ${resourceType}`
            );
    }
};
