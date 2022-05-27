import { ValueType } from '../../lib/types/valueType';
import { IBibliographicReference } from '../models/bibliographic-reference/interfaces/IBibliographicReference';
import { Book } from '../models/book/entities/book.entity';
import { Category } from '../models/categories/entities/category.entity';
import { EdgeConnection } from '../models/context/edge-connection.entity';
import { MediaItem } from '../models/media-item/entities/media-item.entity';
import { Photograph } from '../models/photograph/entities/photograph.entity';
import { Song } from '../models/song/song.entity';
import { ISpatialFeature } from '../models/spatial-feature/ISpatialFeature';
import { Tag } from '../models/tag/tag.entity';
import { Term } from '../models/term/entities/term.entity';
import { TranscribedAudio } from '../models/transcribed-audio/entities/transcribed-audio.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';

export const resourceTypes = {
    term: 'term',
    vocabularyList: 'vocabularyList',
    transcribedAudio: 'transcribedAudio',
    book: 'book',
    photograph: 'photograph',
    spatialFeature: 'spatialFeature',
    bibliographicReference: 'bibliographicReference',
    song: 'song',
    mediaItem: 'mediaItem',
} as const;

export type ResourceType = ValueType<typeof resourceTypes>;

export const isResourceType = (input: unknown): input is ResourceType =>
    Object.values(resourceTypes).includes(input as ResourceType);

// We should use this for type inference a few places.
export type ResourceTypeToInstance = {
    term: Term;
    vocabularyList: VocabularyList;
    transcribedAudio: TranscribedAudio;
    book: Book;
    photograph: Photograph;
    spatialFeature: ISpatialFeature;
    bibliographicReference: IBibliographicReference;
    song: Song;
    mediaItem: MediaItem;
};

/**
 * This represents the state of all domain models, excluding their `Connections`
 */
export type InMemorySnapshotOfResources = {
    [K in ResourceType]?: ResourceTypeToInstance[K][];
};

export type InMemorySnapshot = {
    resources: InMemorySnapshotOfResources;
    connections: EdgeConnection[];
    tags: Tag[];
    /**
     * We do not intend to leak the abstraction of how the categories are
     * represented in the database here. Defer this to (the db specific) document
     * mapping layer.
     */
    categoryTree: Category[];
};
