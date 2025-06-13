import { LanguageCode } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { AggregateId } from '../../../types/AggregateId';

export const PLAYLIST_QUERY_REPOSITORY_TOKEN = 'PLAYLIST_QUERY_REPOSITORY_TOKEN';

export interface IPlaylistQueryRepository extends IResourceQueryRepository<PlaylistViewModel> {
import { IQueryRepositoryForConnectable } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { IQueryRepositoryForAnnotatable } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import {
    ICountable,
    IPublishable,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForAttributable } from '../../shared/common-event-handlers/attributor.event-handler';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/resource-or-note-tagged.event-handler';

export const PLAYLIST_QUERY_REPOSITORY_TOKEN = 'PLAYLIST_QUERY_REPOSITORY_TOKEN';

export interface IPlaylistQueryRepository
    extends IPublishable,
        ICountable,
        IAccessible,
        IQueryRepositoryForTaggable,
        IQueryRepositoryForAnnotatable,
        IQueryRepositoryForConnectable,
        IQueryRepositoryForAttributable {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    delete(id: AggregateId): Promise<void>;

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
