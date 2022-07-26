import { UuidDocument } from '../../lib/id-generation/types/UuidDocument';
import { IBibliographicReference } from '../models/bibliographic-reference/interfaces/bibliographic-reference.interface';
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
import { CoscradUserGroup } from '../models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../models/user-management/user/entities/user/coscrad-user.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';
import { AggregateId } from './AggregateId';

export enum ResourceType {
    term = 'term',
    vocabularyList = 'vocabularyList',
    transcribedAudio = 'transcribedAudio',
    book = 'book',
    photograph = 'photograph',
    spatialFeature = 'spatialFeature',
    bibliographicReference = 'bibliographicReference',
    song = 'song',
    mediaItem = 'mediaItem',
}

export const isResourceType = (input: unknown): input is ResourceType =>
    Object.values(ResourceType).includes(input as ResourceType);

// We should use this for type inference a few places.
export type ResourceTypeToResourceModel = {
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
    [K in ResourceType]?: ResourceTypeToResourceModel[K][];
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
    users: CoscradUser[];
    userGroups: CoscradUserGroup[];
    uuids: UuidDocument<AggregateId>[];
};
