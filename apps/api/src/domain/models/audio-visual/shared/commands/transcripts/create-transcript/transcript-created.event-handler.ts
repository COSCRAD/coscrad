import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../../domain/common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { AggregateId } from '../../../../../../../domain/types/AggregateId';
import { AudiovisualResourceType } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { TranscriptCreated } from './transcript-created.event';

interface IRepository {
    createTranscript(id: AggregateId): Promise<void>;
}

interface IAudiovisualItemQueryRepositoryProvider<T extends IRepository = IRepository> {
    forResource(audiovisualResourceType: AudiovisualResourceType): T;
}

@CoscradEventConsumer('TRANSCRIPT_CREATED')
export class TranscriptCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly audiovisualItemRepositoryProvider: IAudiovisualItemQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: id, type: resourceType },
        },
    }: TranscriptCreated): Promise<void> {
        await this.audiovisualItemRepositoryProvider.forResource(resourceType).createTranscript(id);
    }
}
