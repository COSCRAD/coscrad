import { Maybe } from '../../../lib/types/maybe';
import { ResultOrError } from '../../../types/ResultOrError';
import { AggregateId } from '../../types/AggregateId';
import { CoscradUserWithGroups } from '../user-management/user/entities/user/coscrad-user-with-groups';
import { MediaItem } from './entities/media-item.entity';

export const MEDIA_MANGAER_INJECTION_TOKEN = 'MEDIA_MANGAER_INJECTION_TOKEN';

interface MediaCreationAcknowledgement {
    id: AggregateId;
}

/**
 * TODO Where does this file belong?
 *
 * Note that this service encapsulates queries and writes (commands). This is
 * because we do not want the resources to be aware of the internals of how
 * media items are persisted. It's up to the implementing media item service
 * whether to use commands, do CQRS, etc.
 */
export interface IMediaManager {
    create(binary: ReadableStream): Promise<ResultOrError<MediaCreationAcknowledgement>>;

    discover(filepath: string): Promise<ResultOrError<MediaCreationAcknowledgement>>;

    exists(id: AggregateId): Promise<boolean>;

    fetchById(id: AggregateId): Promise<Maybe<MediaItem>>;

    fetchMany(userWithGroups: CoscradUserWithGroups): Promise<MediaItem[]>;
}
