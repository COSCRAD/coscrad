import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../../queries';
import { AudioAddedForTerm } from './audio-added-for-term.event';

export class AudioAddedForTermEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(TERM_QUERY_REPOSITORY_TOKEN) private readonly repository: ITermQueryRepository
    ) {}

    async handle({
        payload: {
            audioItemId,
            languageCode,
            aggregateCompositeIdentifier: { id: termId },
        },
    }: AudioAddedForTerm): Promise<void> {
        await this.repository.addAudio(termId, languageCode, audioItemId);
    }
}
