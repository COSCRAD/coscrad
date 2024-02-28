import { CoscradEvent } from '../../../../../../domain/common';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { TranslateVideoName } from './translate-video-name.command';

export type VideoNameTranslatedPayload = TranslateVideoName;

@CoscradEvent('VIDEO_NAME_TRANSLATED')
export class VideoNameTranslated extends BaseEvent<VideoNameTranslatedPayload> {
    readonly type = 'VIDEO_NAME_TRANSLATED';
}
