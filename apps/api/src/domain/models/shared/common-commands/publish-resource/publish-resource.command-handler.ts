import { CommandHandler, ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER } from '../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { Resource } from '../../../resource.entity';
import { BaseCommandHandler } from '../../command-handlers/base-command-handler';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../events/base-event.entity';
import { PublishResource } from './publish-resource.command';
import { ResourcePublished } from './resource-published.event';

@CommandHandler(PublishResource)
export class PublishResourceCommandHandler extends BaseCommandHandler<Resource> {
    constructor(
        @Inject(REPOSITORY_PROVIDER) protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);
    }

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

    protected buildEvent(command: ICommand, eventId: string, userId: string): BaseEvent {
        return new ResourcePublished(command, eventId, userId);
    }

    protected async persist(
        instance: Resource,
        command: PublishResource,
        userId: string
    ): Promise<void> {
        const {
            aggregateCompositeIdentifier: { type: resourceType },
        } = command;

        /**
         * TODO Share this logic with `BaseUpdateCommandHandler`
         */
        // generate a unique ID for the event
        const eventId = await this.idManager.generate();

        await this.idManager.use(eventId);

        const event = this.buildEvent(command, eventId, userId);

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(event);

        await this.repositoryProvider
            .forResource(resourceType)
            .update(instanceToPersistWithUpdatedEventHistory);
    }
}
