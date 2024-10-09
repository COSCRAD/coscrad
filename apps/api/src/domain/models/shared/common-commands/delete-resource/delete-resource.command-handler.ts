import { CommandHandler, ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { EVENT } from '../../../../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Resource } from '../../../resource.entity';
import { BaseCommandHandler } from '../../command-handlers/base-command-handler';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../events/base-event.entity';
import { EventRecordMetadata } from '../../events/types/EventRecordMetadata';
import { DeleteResource } from './delete-resource.command';
import { ResourceDeleted } from './resource-deleted.event';

@CommandHandler(DeleteResource)
export class DeleteResourceCommandHandler extends BaseCommandHandler<Resource> {
    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier: { type: resourceType, id },
    }): Promise<ResultOrError<Resource>> {
        const searchResult = await this.repositoryProvider.forResource(resourceType).fetchById(id);

        if (isNotFound(searchResult)) {
            return new AggregateNotFoundError({ type: resourceType, id });
        }
    }
    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();
    }
    protected actOnInstance(instance: Resource, _: ICommand): ResultOrError<Resource> {
        return instance.delete();
    }
    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Resource
    ): Valid | InternalError {
        return Valid;
    }
    protected buildEvent(command: DeleteResource, eventMeta: EventRecordMetadata): BaseEvent {
        return new ResourceDeleted(command, eventMeta);
    }
    protected async persist(
        instance: Resource,
        command: DeleteResource,
        userId: AggregateId,
        contributorIds: AggregateId[]
    ): Promise<void> {
        const {
            aggregateCompositeIdentifier: { type: resourceType },
        } = command;

        const eventId = await this.idManager.generate();

        await this.idManager.use({ id: eventId, type: EVENT });

        const event = this.buildEvent(command, {
            id: eventId,
            userId,
            dateCreated: Date.now(),
            contributorIds: contributorIds || [],
        });

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(event);

        await this.repositoryProvider
            .forResource(resourceType)
            .update(instanceToPersistWithUpdatedEventHistory);
    }
}
