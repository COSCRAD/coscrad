import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../../domain/common';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { AggregateId } from '../../../../../../../domain/types/AggregateId';
import { AudiovisualResourceType } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { ParticipantAddedToTranscript } from './participant-added-to-transcript.event';

interface IRepository {
    addParticipant(id: AggregateId, participant: TranscriptParticipant): Promise<void>;
}

interface IAudiovisualItemQueryRepositoryProvider<T extends IRepository = IRepository> {
    forResource(audiovisualResourceType: AudiovisualResourceType): T;
}

@CoscradEventConsumer('PARTICIPANT_ADDED_TO_TRANSCRIPT')
export class ParticipantAddedToTranscriptEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly audiovisualItemRepositoryProvider: IAudiovisualItemQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id, type: audioVisualItemType },
            name,
            initials,
        },
    }: ParticipantAddedToTranscript): Promise<void> {
        await this.audiovisualItemRepositoryProvider
            .forResource(audioVisualItemType)
            .addParticipant(id, new TranscriptParticipant({ name, initials }));
    }
}
