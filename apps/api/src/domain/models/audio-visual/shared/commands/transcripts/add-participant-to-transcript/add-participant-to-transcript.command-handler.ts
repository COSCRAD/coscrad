import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../../types/ResultOrError';
import { Valid } from '../../../../../../domainModelValidators/Valid';
import {
    EVENT,
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../../interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../../../../../types/AggregateId';
import { AggregateType } from '../../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../types/ResourceType';
import { BaseCommandHandler } from '../../../../../shared/command-handlers/base-command-handler';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../../shared/events/types/EventRecordMetadata';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { AddParticipantToTranscript } from './add-participant-to-transcript.command';
import { ParticipantAddedToTranscript } from './participant-added-to-transcript.event';

@CommandHandler(AddParticipantToTranscript)
export class AddParticipantToTranscriptCommandHandler extends BaseCommandHandler<
    AudioItem | Video
> {
    protected aggregateType: AggregateType = AggregateType.audioItem;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);
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

    // TODO There's still lots of overlap with the `create` command handler base- move to base class
    protected async persist(
        instance: AudioItem | Video,
        command: AddParticipantToTranscript,
        systemUserId: AggregateId,
        contributorIds?: AggregateId[]
    ): Promise<void> {
        // generate a unique ID for the event
        const eventId = await this.idManager.generate();

        await this.idManager.use({ id: eventId, type: EVENT });

        const event = this.buildEvent(command, {
            id: eventId,
            userId: systemUserId,
            dateCreated: Date.now(),
            contributorIds: contributorIds || [],
        });

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(event);

        const {
            aggregateCompositeIdentifier: { type: resourceType },
        } = command;

        await this.repositoryProvider
            .forResource(resourceType)
            .update(instanceToPersistWithUpdatedEventHistory);
    }
}
