import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { AudioAddedForTerm } from './audio-added-for-term.event';

@CoscradEventConsumer('AUDIO_ADDED_FOR_TERM')
export class AudioAddedForTermEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly repository: ITermQueryRepository
    ) {}

    async handle(event: AudioAddedForTerm): Promise<void> {
        if (!event.isOfType('AUDIO_ADDED_FOR_TERM')) return;

        const {
            payload: {
                audioItemId,
                languageCode,
                aggregateCompositeIdentifier: { id: termId },
            },
        } = event;

        await this.repository.addAudio(termId, languageCode, audioItemId);
    }
}
