import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../../lib/types/maybe';
import { AggregateId } from '../../../../types/AggregateId';
import { IPublishable } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { TranscriptParticipant } from '../../shared/entities/transcript-participant';
import { TranscriptLineItemDto } from '../commands';
import { EventSourcedAudioItemViewModel } from './audio-item.view-model.event-sourced';

export const AUDIO_QUERY_REPOSITORY_TOKEN = 'AUDIO_QUERY_REPOSITORY_TOKEN';

export interface IAudioItemQueryRepository extends IPublishable {
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
}
