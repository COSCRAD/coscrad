import { LanguageCode } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { Maybe } from '../../../../lib/types/maybe';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { AggregateId } from '../../../types/AggregateId';
import {
    ICountable,
    IPublishable,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';

export const PLAYLIST_QUERY_REPOSITORY_TOKEN = 'PLAYLIST_QUERY_REPOSITORY_TOKEN';

export interface IPlaylistQueryRepository extends IPublishable, ICountable {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    create(view: PlaylistViewModel): Promise<void>;

    createMany(views: PlaylistViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    attribute(id: AggregateId, contributorIds: AggregateId[]): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<PlaylistViewModel>>;

    fetchMany(): Promise<PlaylistViewModel[]>;

    allowUser(id: AggregateId, userId: AggregateId): Promise<void>;

    addAudioItem(id: AggregateId, audioItemId: AggregateId): Promise<void>;

    translatePlaylistName(
        id: AggregateId,
        translation: string,
        languageCode: LanguageCode
    ): Promise<void>;

    importAudioItems(id: AggregateId, audioItemIds: AggregateId[]): Promise<void>;
}
