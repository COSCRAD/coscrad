import { CommandHandler, ICommand } from '@coscrad/commands';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { EVENT } from '../../../../interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { Resource } from '../../../resource.entity';
import { BaseCommandHandler } from '../../command-handlers/base-command-handler';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../events/base-event.entity';
import { EventRecordMetadata } from '../../events/types/EventRecordMetadata';
import { PublishResource } from './publish-resource.command';
import { ResourcePublished } from './resource-published.event';

@CommandHandler(PublishResource)
export class PublishResourceCommandHandler extends BaseCommandHandler<Resource> {
    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier: { type: resourceType, id },
    }: PublishResource): Promise<ResultOrError<Resource>> {
        const searchResult = await this.repositoryProvider.forResource(resourceType).fetchById(id);

        if (isNotFound(searchResult)) {
            return new AggregateNotFoundError({ type: resourceType, id });
        }

        return searchResult;
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(_: InMemorySnapshot, __: Resource): Valid | InternalError {
        return Valid;
    }

    // There is no information on the payload required here.
    protected actOnInstance(instance: Resource, _: ICommand): ResultOrError<Resource> {
        return instance.publish();
    }

    protected buildEvent(command: PublishResource, eventMeta: EventRecordMetadata): BaseEvent {
        return new ResourcePublished(command, eventMeta);
    }

    protected async persist(
        instance: Resource,
        command: PublishResource,
        userId: string,
        contributorIds?: AggregateId[]
    ): Promise<void> {
        const {
            aggregateCompositeIdentifier: { type: resourceType },
        } = command;

        /**
         * TODO Share this logic with `BaseUpdateCommandHandler`
         */
        // generate a unique ID for the event
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

        /**
         * This is a huge gotcha. We need to use a proper messaging queue
         * that automatically pulls from the event db.
         */
        this.eventPublisher.publish(event);
    }
}
