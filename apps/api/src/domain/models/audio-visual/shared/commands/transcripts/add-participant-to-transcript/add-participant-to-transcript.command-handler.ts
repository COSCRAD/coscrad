import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../../../domain/common';
import { ICoscradEventPublisher } from '../../../../../../../domain/common/events/interfaces';
import { BaseUpdateCommandHandler } from '../../../../../../../domain/models/shared/command-handlers/base-update-command-handler';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../../types/ResultOrError';
import { Valid } from '../../../../../../domainModelValidators/Valid';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../types/ResourceType';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../../shared/events/types/EventRecordMetadata';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { AddParticipantToTranscript } from './add-participant-to-transcript.command';
import { ParticipantAddedToTranscript } from './participant-added-to-transcript.event';

@CommandHandler(AddParticipantToTranscript)
export class AddParticipantToTranscriptCommandHandler extends BaseUpdateCommandHandler<
    AudioItem | Video
> {
    protected aggregateType: AggregateType = AggregateType.audioItem;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);
    }

    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier,
    }: AddParticipantToTranscript): Promise<ResultOrError<AudioItem | Video>> {
        const { type: resourceType, id } = aggregateCompositeIdentifier;

        const searchResult = await this.repositoryProvider
            .forResource<AudioItem | Video>(resourceType)
            .fetchById(id);

        if (isNotFound(searchResult))
            return new AggregateNotFoundError(aggregateCompositeIdentifier);

        return searchResult;
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
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new ParticipantAddedToTranscript(command, eventMeta);
    }
}
