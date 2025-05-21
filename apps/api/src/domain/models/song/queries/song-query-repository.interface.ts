import { Maybe } from '../../../../lib/types/maybe';
import { AggregateId } from '../../../types/AggregateId';
import { EventSourcedSongViewModel } from './song.view-model.event.sourced';

export const SONG_QUERY_REPOSITORY_TOKEN = 'SONG_QUERY_REPOSITORY_TOKEN';

export interface ISongQueryRepository {
    create(view: EventSourcedSongViewModel): Promise<void>;

    createMany(view: EventSourcedSongViewModel[]): Promise<void>;

    // delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<EventSourcedSongViewModel>>;

    // fetchMany(): Promise<EventSourcedAudioItemViewModel[]>;

    // translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    count(): Promise<number>;

    // addLyrics(): Promise<void>;

    // translateLyrics(): Promise<void>;
}
