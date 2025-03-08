import { Maybe } from '../../lib/types/maybe';
import { MediaItem } from '../models/media-item/entities/media-item.entity';
import { AggregateId } from '../types/AggregateId';

export interface IMediaManagementService {
    exists(mediaItemId: AggregateId): Promise<Boolean>;

    fetchById(): Promise<Maybe<MediaItem>>;

    fetchMany(): Promise<MediaItem[]>;

    // TODO This should take a stream of binary data in some format
    create(mediaItem: MediaItem): Promise<Error[]>;
}
