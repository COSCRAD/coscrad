import { LanguageCode } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { Maybe } from '../../../../lib/types/maybe';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import {
    ICountable,
    IPublishable,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/resource-or-note-tagged.event-handler';

export const PLAYLIST_QUERY_REPOSITORY_TOKEN = 'PLAYLIST_QUERY_REPOSITORY_TOKEN';

export interface IPlaylistQueryRepository
    extends IPublishable,
        ICountable,
        IAccessible,
        IQueryRepositoryForTaggable {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    create(view: PlaylistViewModel): Promise<void>;

    createMany(views: PlaylistViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    // TODO introduce an interface for this
    attribute(id: AggregateId, event: BaseEvent): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<PlaylistViewModel>>;

    fetchMany(): Promise<PlaylistViewModel[]>;

    addAudioItem(id: AggregateId, audioItemId: AggregateId): Promise<void>;

    translatePlaylistName(
        id: AggregateId,
        translation: string,
        languageCode: LanguageCode
    ): Promise<void>;

    importAudioItems(id: AggregateId, audioItemIds: AggregateId[]): Promise<void>;
}
