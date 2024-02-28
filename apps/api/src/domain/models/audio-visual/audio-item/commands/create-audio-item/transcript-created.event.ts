import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CreateAudioItem } from './create-audio-item.command';

export type AudioItemCreatedPayload = CreateAudioItem;

export class AudioItemCreated extends BaseEvent<AudioItemCreatedPayload> {
    readonly type = 'AUDIO_ITEM_CREATED';
}
