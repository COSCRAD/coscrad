import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';
import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { AggregateId } from '../../../types/AggregateId';
import { EventSourcedSongViewModel } from './song.view-model.event.sourced';

export const SONG_QUERY_REPOSITORY_TOKEN = 'SONG_QUERY_REPOSITORY_TOKEN';

export interface ISongQueryRepository extends IResourceQueryRepository<EventSourcedSongViewModel> {
    delete(id: AggregateId): Promise<void>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    addLyrics(id: AggregateId, textForLyrics: string, languageCode: LanguageCode): Promise<void>;

    translateLyrics(id: AggregateId, translation: IMultilingualTextItem): Promise<void>;
}
