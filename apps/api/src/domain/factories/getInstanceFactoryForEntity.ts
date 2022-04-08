import { InternalError } from '../../lib/errors/InternalError';
import { ResultOrError } from '../../types/ResultOrError';
import audioWithTranscriptValidator from '../domainModelValidators/audioWithTranscriptValidator';
import bookValidator from '../domainModelValidators/bookValidator';
import photographValidator from '../domainModelValidators/photographValidator';
import tagValidator from '../domainModelValidators/tagValidator';
import termValidator from '../domainModelValidators/termValidator';
import vocabularyListValidator from '../domainModelValidators/vocabularyListValidator';
import { AudioWithTranscript } from '../models/audio-with-transcript/entities/audio-with-transcript.entity';
import { Book } from '../models/book/entities/book.entity';
import { Entity } from '../models/entity';
import { Photograph } from '../models/photograph/entities/photograph.entity';
import { Tag } from '../models/tag/tag.entity';
import { Term } from '../models/term/entities/term.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';
import { EntityType, entityTypes } from '../types/entityTypes';
import buildSpatialFeatureFactory from './complexFactories/buildSpatialFeatureFactory';
import buildInstanceFactory from './utilities/buildInstanceFactory';

export type InstanceFactory<TEntity> = (dto: unknown) => ResultOrError<TEntity>;

/**
 * It would be nice to find a pattern that gives us better type safety.
 */
export default <TEntity extends Entity>(entityType: EntityType): InstanceFactory<TEntity> => {
    switch (entityType) {
        case entityTypes.term:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Term>(termValidator, Term);

        case entityTypes.vocabularyList:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<VocabularyList>(vocabularyListValidator, VocabularyList);

        case entityTypes.tag:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Tag>(tagValidator, Tag);

        case entityTypes.audioWithTranscript:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<AudioWithTranscript>(
                audioWithTranscriptValidator,
                AudioWithTranscript
            );

        case entityTypes.book:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Book>(bookValidator, Book);

        case entityTypes.photograph:
            // @ts-expect-error TODO fix this tricky type error
            return buildInstanceFactory<Photograph>(photographValidator, Photograph);

        case entityTypes.spatialFeature:
            // @ts-expect-error TODO fix this tricky type error
            return buildSpatialFeatureFactory();

        default:
            throw new InternalError(
                `Failed to build instance factory for unknown entity type ${entityType}`
            );
    }
};
