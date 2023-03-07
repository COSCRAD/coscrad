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
import { ITranscribable } from '../../../entities/transcribable.mixin';
import { AddLineItemToTranscript } from './add-line-item-to-transcript.command';
import { LineItemAddedToTranscript } from './line-item-added-to-transcript.event';

type TranscribableResource = ITranscribable & Resource;

@CommandHandler(AddLineItemToTranscript)
export class AddLineItemtoTranscriptCommandHandler extends BaseCommandHandler<TranscribableResource> {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);
    }

    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier,
    }: AddLineItemToTranscript): Promise<ResultOrError<TranscribableResource>> {
        const { type: resourceType, id } = aggregateCompositeIdentifier;

        const searchResult = await this.repositoryProvider.forResource(resourceType).fetchById(id);

        if (isNotFound(searchResult)) return new AggregateNotFoundError({ type: resourceType, id });

        return searchResult as TranscribableResource;
    }

    protected actOnInstance(
        instance: TranscribableResource,
        {
            inPointMilliseconds,
            outPointMilliseconds,
            text,
            speakerInitials,
        }: AddLineItemToTranscript
    ): ResultOrError<TranscribableResource> {
        return instance.addLineItemToTranscript({
            inPoint: inPointMilliseconds,
            outPoint: outPointMilliseconds,
            text,
            speakerInitials,
        }) as unknown as TranscribableResource;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: TranscribableResource
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        command: AddLineItemToTranscript,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new LineItemAddedToTranscript(command, eventId, userId);
    }

    /**
     * TODO Introduce an `upsert` method on our repositories and then we can share
     * `persist` method with the base command handler across all commands.
     *
     * Note that if we move to true CQRS-ES, we will simply publish the event
     * (which will write to the command db then trigger publishing it to view
     * subscribers via messaging queue).
     */
    protected async persist(
        instance: ITranscribable & Resource,
        command: AddLineItemToTranscript,
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
