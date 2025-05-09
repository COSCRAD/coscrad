import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../../lib/types/maybe';
import { AggregateId } from '../../../../types/AggregateId';
import { EventSourcedVideoViewModel } from './video-view-model.event-sourced';

export const VIDEO_QUERY_REPOSITORY_TOKEN = 'VIDEO_QUERY_REPOSITORY_TOKEN';

// export interface TranslationLineItemDto {
//     inPointMilliseconds: number;
//     outPointMilliseconds: number;
//     text: string;
//     languageCode: LanguageCode;
// }

// export interface IAudioItemQueryRepository extends IPublishable, IAccessible {
export interface IVideoQueryRepository {
    create(view: EventSourcedVideoViewModel): Promise<void>;

    createMany(view: EventSourcedVideoViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<EventSourcedVideoViewModel>>;

    fetchMany(): Promise<EventSourcedVideoViewModel[]>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    count(): Promise<number>;

    // createTranscript(id: AggregateId): Promise<void>;

    // addParticipant(id: AggregateId, participant: TranscriptParticipant): Promise<void>;

    // TODO extend an ITranscriptQueryRepository
    // addLineItem(id: AggregateId, lineItem: TranscriptLineItemDto): Promise<void>;

    // importLineItems(id: AggregateId, lineItems: TranscriptLineItemDto[]): Promise<void>;

    // translateLineItem(id: AggregateId, lineItem: TranslationLineItemDto): Promise<void>;

    // importTranslationsForTranscript(
    //     id: AggregateId,
    //     translations: TranslationItem[]
    // ): Promise<void>;
}
