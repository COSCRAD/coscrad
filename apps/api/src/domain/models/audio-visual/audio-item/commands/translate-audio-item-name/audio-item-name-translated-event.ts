import { CoscradEvent } from '../../../../../../domain/common';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { TranslateAudioItemName } from './translate-audio-item-name.command';

export type AudioItemNameTranslatedPayload = TranslateAudioItemName;

@CoscradEvent('AUDIO_ITEM_NAME_TRANSLATED')
export class AudioItemNameTranslated extends BaseEvent<AudioItemNameTranslatedPayload> {
    readonly type = 'AUDIO_ITEM_NAME_TRANSLATED';
}
