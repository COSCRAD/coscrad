import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../domain/common';
import {
    EventSourcedVideoViewModel,
    IVideoQueryRepository,
    VIDEO_QUERY_REPOSITORY_TOKEN,
} from '../../queries';
import { VideoCreated } from './video-created.event';

@CoscradEventConsumer('VIDEO_CREATED')
export class VideoCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(VIDEO_QUERY_REPOSITORY_TOKEN)
        private readonly videoRepository: IVideoQueryRepository
    ) {}

    async handle(event: VideoCreated): Promise<void> {
        const view = EventSourcedVideoViewModel.fromVideoCreated(event);

        await this.videoRepository.create(view);
    }
}
