import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../../lib/types/maybe';
import { AggregateId } from '../../../../types/AggregateId';
import { IAccessible } from '../../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { IPublishable } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { TranscriptLineItemDto } from '../../shared/commands/transcripts/import-line-items-to-transcript';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { TranslationItem } from '../commands';
import { EventSourcedAudioItemViewModel } from './audio-item.view-model.event-sourced';

export const AUDIO_QUERY_REPOSITORY_TOKEN = 'AUDIO_QUERY_REPOSITORY_TOKEN';

export interface TranslationLineItemDto {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    text: string;
    languageCode: LanguageCode;
}

export interface IAudioItemQueryRepository extends IPublishable, IAccessible {
    create(view: EventSourcedAudioItemViewModel): Promise<void>;

    createMany(view: EventSourcedAudioItemViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<EventSourcedAudioItemViewModel>>;

    fetchMany(): Promise<EventSourcedAudioItemViewModel[]>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    count(): Promise<number>;

    createTranscript(id: AggregateId): Promise<void>;

    addParticipant(id: AggregateId, participant: TranscriptParticipant): Promise<void>;

    // should this be the DTO type?
    addLineItem(id: AggregateId, lineItem: TranscriptLineItemDto): Promise<void>;

    importLineItems(id: AggregateId, lineItems: TranscriptLineItemDto[]): Promise<void>;

    translateLineItem(id: AggregateId, lineItem: TranslationLineItemDto): Promise<void>;

    importTranslationsForTranscript(
        id: AggregateId,
        translations: TranslationItem[]
    ): Promise<void>;
}
