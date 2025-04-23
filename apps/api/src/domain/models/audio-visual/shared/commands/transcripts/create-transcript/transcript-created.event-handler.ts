import { ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../../domain/common';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../../../../audio-item/queries/audio-item-query-repository.interface';
import { TranscriptCreated } from './transcript-created.event';

@CoscradEventConsumer('TRANSCRIPT_CREATED')
export class TranscriptCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(AUDIO_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IAudioItemQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: id, type: resourceType },
        },
    }: TranscriptCreated): Promise<void> {
        if (resourceType === ResourceType.video) {
            throw new InternalError('event sourcing video views is not yet supported');
        }

        await this.queryRepository.createTranscript(id);
    }
}
