import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';
import { IResourceQueryRepository } from '../../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { ITranscriptQueryRepository } from '../../shared/queries/transcript-query-repository.interface';
import { EventSourcedAudioItemViewModel } from './audio-item.view-model.event-sourced';

export const AUDIO_QUERY_REPOSITORY_TOKEN = 'AUDIO_QUERY_REPOSITORY_TOKEN';

export interface TranslationLineItemDto {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    text: string;
    languageCode: LanguageCode;
}

export interface IAudioItemQueryRepository
    extends IResourceQueryRepository<EventSourcedAudioItemViewModel>,
        ITranscriptQueryRepository {
    delete(id: AggregateId): Promise<void>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;
}
