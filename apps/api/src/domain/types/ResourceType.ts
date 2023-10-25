import { UuidDocument } from '../../lib/id-generation/types/UuidDocument';
import { AudioItem } from '../models/audio-item/entities/audio-item.entity';
import { IBibliographicReference } from '../models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { Book } from '../models/book/entities/book.entity';
import { Category } from '../models/categories/entities/category.entity';
import { EdgeConnection } from '../models/context/edge-connection.entity';
import { MediaItem } from '../models/media-item/entities/media-item.entity';
import { Photograph } from '../models/photograph/entities/photograph.entity';
import { Song } from '../models/song/song.entity';
import { ISpatialFeature } from '../models/spatial-feature/interfaces/spatial-feature.interface';
import { Tag } from '../models/tag/tag.entity';
import { Term } from '../models/term/entities/term.entity';
import { CoscradUserGroup } from '../models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../models/user-management/user/entities/user/coscrad-user.entity';
import { VocabularyList } from '../models/vocabulary-list/entities/vocabulary-list.entity';

import { ResourceType } from '@coscrad/api-interfaces';
import { Video } from '../models/audio-item/entities/video.entity';
import { DigitalText } from '../models/digital-text/entities/digital-text.entity';
import { Playlist } from '../models/playlist';

export { ResourceType };

export const isResourceType = (input: unknown): input is ResourceType =>
    Object.values(ResourceType).includes(input as ResourceType);

/**
 *  We should use this for type inference a few places. But is this really
 * necessary? What value do we gain?
 *
 * I suppose it is critical to define this type so that in tests we get type
 * safety when we find an instance by `ResourceType`.
 */
export type ResourceTypeToResourceModel = {
    term: Term;
    vocabularyList: VocabularyList;
    audioItem: AudioItem;
    video: Video;
    book: Book;
    photograph: Photograph;
    spatialFeature: ISpatialFeature;
    bibliographicReference: IBibliographicReference;
    digitalText: DigitalText;
    song: Song;
    mediaItem: MediaItem;
    playlist: Playlist;
};

/**
 * This represents the state of all domain models, excluding their `Connections`
 */
export type InMemorySnapshotOfResources = {
    [K in ResourceType]?: ResourceTypeToResourceModel[K][];
};

export type InMemorySnapshot = {
    resources: InMemorySnapshotOfResources;
    note: EdgeConnection[];
    tag: Tag[];
    /**
     * We do not intend to leak the abstraction of how the categories are
     * represented in the database here. Defer this to (the db specific) document
     * mapping layer.
     */
    category: Category[];
    user: CoscradUser[];
    userGroup: CoscradUserGroup[];
    uuid: UuidDocument[];
};
