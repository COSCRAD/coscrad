import { CoscradEvent } from '../../../../../../domain/common';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CreateAudioItem } from './create-audio-item.command';

export type AudioItemCreatedPayload = CreateAudioItem;

@CoscradEvent('AUDIO_ITEM_CREATED')
export class AudioItemCreated extends BaseEvent<AudioItemCreatedPayload> {
    readonly type = 'AUDIO_ITEM_CREATED';
}
