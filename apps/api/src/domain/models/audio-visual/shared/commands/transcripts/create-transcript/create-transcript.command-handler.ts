import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { EVENT_PUBLISHER_TOKEN } from '../../../../../../../domain/common';
import { ICoscradEventPublisher } from '../../../../../../../domain/common/events/interfaces';
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
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../../types/ResourceType';
import { BaseCommandHandler } from '../../../../../shared/command-handlers/base-command-handler';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../../shared/events/types/EventRecordMetadata';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { Video } from '../../../../video/entities/video.entity';
import { CreateTranscript } from './create-transcript.command';
import { TranscriptCreated } from './transcript-created.event';

@CommandHandler(CreateTranscript)
export class CreateTranscriptCommandHandler extends BaseCommandHandler<AudioItem | Video> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {
        super(repositoryProvider, idManager, eventPublisher);
    }

    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier: { type, id },
    }: CreateTranscript): Promise<ResultOrError<AudioItem | Video>> {
        const searchResult = await this.repositoryProvider
            .forResource<AudioItem | Video>(type)
            .fetchById(id);

        if (isNotFound(searchResult)) return new AggregateNotFoundError({ type, id });

        return searchResult;
    }

    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        // should we program to `HasCreateTranscript` or `Transcribable` here?
        instance: AudioItem | Video,
        _command: CreateTranscript
    ): ResultOrError<AudioItem | Video> {
        return instance.createTranscript() as unknown as AudioItem | Video;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        __instance: AudioItem
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(command: CreateTranscript, eventMeta: EventRecordMetadata): BaseEvent {
        return new TranscriptCreated(command, eventMeta);
    }

    // Why do we need persist here?
    // TODO This overlaps with the generic base-update command handler- how can we reuse without complex inheritance hierarchies?
    protected async persist(
        instance: AudioItem | Video,
        command: CreateTranscript,
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

        /**
         * TODO
         * 1. Share this logic with the base-update-command handler
         * 2. Move event publication out of process by pulling events from the
         * command database and publishing via a proper messaging queue.
         */
        this.eventPublisher.publish(event);
    }
}
