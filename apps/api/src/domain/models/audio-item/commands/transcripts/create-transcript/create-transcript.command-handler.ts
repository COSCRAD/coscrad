import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import {
    EVENT,
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../../../../types/AggregateId';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { Resource } from '../../../../resource.entity';
import { BaseCommandHandler } from '../../../../shared/command-handlers/base-command-handler';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { AudioItem } from '../../../entities/audio-item.entity';
import { ITranscribable } from '../../../entities/transcribable.mixin';
import { Video } from '../../../entities/video.entity';
import { CreateTranscript } from './create-transcript.command';
import { TranscriptCreated } from './transcript-created.event';

@CommandHandler(CreateTranscript)
export class CreateTranscriptCommandHandler extends BaseCommandHandler<ITranscribable & Resource> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);
    }

    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier: { type, id },
    }: CreateTranscript): Promise<ResultOrError<ITranscribable & Resource>> {
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
        instance: ITranscribable & Resource,
        _command: CreateTranscript
    ): ResultOrError<ITranscribable & Resource> {
        return instance.createTranscript() as unknown as AudioItem;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        __instance: AudioItem
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(command: CreateTranscript, eventId: string, userId: string): BaseEvent {
        return new TranscriptCreated(command, eventId, userId);
    }

    // TODO This overlaps with the generic base-update command handler- how can we reuse without complex inheritance hierarchies?
    protected async persist(
        instance: ITranscribable & Resource,
        command: CreateTranscript,
        systemUserId: AggregateId
    ): Promise<void> {
        // generate a unique ID for the event
        const eventId = await this.idManager.generate();

        await this.idManager.use({ id: eventId, type: EVENT });

        const event = this.buildEvent(command, eventId, systemUserId);

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(event);

        const {
            aggregateCompositeIdentifier: { type: resourceType },
        } = command;

        await this.repositoryProvider
            .forResource(resourceType)
            .update(instanceToPersistWithUpdatedEventHistory);
    }
}
