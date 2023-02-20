import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { AudioItem } from '../../../entities/audio-item.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { AddParticipantToTranscript } from './add-participant-to-transcript.command';
import { ParticipantAddedToTranscript } from './participant-added-to-transcript.event';

@CommandHandler(AddParticipantToTranscript)
export class AddParticipantToTranscriptCommandHandler extends BaseUpdateCommandHandler<AudioItem> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<AudioItem>;

    protected aggregateType: AggregateType = AggregateType.audioItem;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<AudioItem>(
            ResourceType.audioItem
        );
    }

    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        instance: AudioItem,
        { name, initials }: AddParticipantToTranscript
    ): ResultOrError<AudioItem> {
        const updatedInstance = instance.addParticipantToTranscript(
            new TranscriptParticipant({
                name,
                initials,
            })
        );

        return updatedInstance as unknown as AudioItem;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: AudioItem
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AddParticipantToTranscript,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new ParticipantAddedToTranscript(command, eventId, userId);
    }
}
