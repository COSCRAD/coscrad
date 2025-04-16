import { Observable } from 'rxjs';
import { Maybe } from '../../../../lib/types/maybe';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { AggregateId } from '../../../types/AggregateId';

export const PLAYLIST_QUERY_REPOSITORY_TOKEN = 'PLAYLIST_QUERY_REPOSITORY_TOKEN';

export interface IPlaylistQueryRepository {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    create(view: PlaylistViewModel): Promise<void>;

    createMany(views: PlaylistViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    attribute(id: AggregateId, contributorIds: AggregateId[]): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<PlaylistViewModel>>;

    fetchMany(): Promise<PlaylistViewModel[]>;

    publish(id: AggregateId): Promise<void>;

    allowUser(id: AggregateId, userId: AggregateId): Promise<void>;

    addAudioItem(id: AggregateId, audioItemId: AggregateId): Promise<void>;
}
