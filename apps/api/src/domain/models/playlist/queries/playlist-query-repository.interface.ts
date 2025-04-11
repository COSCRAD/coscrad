import { Observable } from 'rxjs';
import { Maybe } from '../../../../lib/types/maybe';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { AggregateId } from '../../../types/AggregateId';

export const PLAYLIST_QUERY_REPOSITORY_TOKEN = 'PLAYLIST_QUERY_REPOSITORY_TOKEN';

export interface IPlaylistQueryRepository {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    create(view: PlaylistViewModel): Promise<void>;

    createMany(views: PlaylistViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<PlaylistViewModel>>;

    fetchMany(): Promise<PlaylistViewModel[]>;

    allowUser(id: AggregateId, userId: AggregateId): Promise<void>;
}
