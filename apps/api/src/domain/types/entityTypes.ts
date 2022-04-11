import { ValueType } from '../../lib/types/valueType';
import { Book } from '../models/book/entities/book.entity';
import { Photograph } from '../models/photograph/entities/photograph.entity';
import { ISpatialFeature } from '../models/spatial-feature/ISpatialFeature';
import { Tag } from '../models/tag/tag.entity';
import { Term } from '../models/term/entities/term.entity';
import { TranscribedAudio } from '../models/transcribed-audio/entities/transcribed-audio.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';

export const entityTypes = {
    term: 'term',
    vocabularyList: 'vocabularyList',
    transcribedAudio: 'transcribedAudio',
    book: 'book',
    photograph: 'photograph',
    spatialFeature: 'spatialFeature',
    // TODO This doesn't belong here. It should be a stand-alone.
    tag: 'tag',
} as const;

export type EntityType = ValueType<typeof entityTypes>;

export const isEntityType = (input: unknown): input is EntityType =>
    Object.values(entityTypes).includes(input as EntityType);

// We should use this for type inference a few places.
export type EntityTypeToInstance = {
    term: Term;
    vocabularyList: VocabularyList;
    transcribedAudio: TranscribedAudio;
    book: Book;
    photograph: Photograph;
    spatialFeature: ISpatialFeature;
    tag: Tag;
};

/**
 * This represents the state of all domain models, excluding their `Connections`
 */
export type InMemorySnapshot = {
    [K in EntityType]?: EntityTypeToInstance[K][];
};
