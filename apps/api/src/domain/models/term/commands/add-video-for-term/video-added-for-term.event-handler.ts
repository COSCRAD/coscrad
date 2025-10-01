import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { VideoAddedForTerm } from './video-added-for-term.event';

@CoscradEventConsumer('VIDEO_ADDED_FOR_TERM')
export class VideoAddedForTermEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly repository: ITermQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: termId },
            videoId,
        },
    }: VideoAddedForTerm): Promise<void> {
        await this.repository.addVideo(termId, videoId);
    }
}
