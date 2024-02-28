import { CoscradEvent } from '../../../../../../domain/common';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CreateVideo } from './create-video.command';

export type VideoCreatedPayload = CreateVideo;

@CoscradEvent('VIDEO_CREATED')
export class VideoCreated extends BaseEvent<VideoCreatedPayload> {
    readonly type = 'VIDEO_CREATED';
}
