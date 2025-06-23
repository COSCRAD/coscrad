import { LanguageCode } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { AggregateId } from '../../../types/AggregateId';

export const PLAYLIST_QUERY_REPOSITORY_TOKEN = 'PLAYLIST_QUERY_REPOSITORY_TOKEN';

export interface IPlaylistQueryRepository extends IResourceQueryRepository<PlaylistViewModel> {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    delete(id: AggregateId): Promise<void>;

    addAudioItem(id: AggregateId, audioItemId: AggregateId): Promise<void>;

    translatePlaylistName(
        id: AggregateId,
        translation: string,
        languageCode: LanguageCode
    ): Promise<void>;

    importAudioItems(id: AggregateId, audioItemIds: AggregateId[]): Promise<void>;
}
