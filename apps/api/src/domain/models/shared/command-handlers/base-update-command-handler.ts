import { ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../../types/ResultOrError';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { IEvent } from '../events/interfaces/event.interface';
import { CommandHandlerBase } from './command-handler-base';

export abstract class BaseUpdateCommandHandler<
    TAggregate extends Resource
> extends CommandHandlerBase<TAggregate> {
    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager,
        protected readonly resourceType: ResourceType
    ) {
        super(repositoryProvider, idManager);
    }

    protected abstract eventFactory(command: ICommand, eventId: AggregateId): IEvent;

    protected abstract fetchInstanceToUpdate(command: ICommand): Promise<ResultOrError<TAggregate>>;

    protected createOrFetchWriteContext(command: ICommand): Promise<ResultOrError<TAggregate>> {
        return this.fetchInstanceToUpdate(command);
    }

    // TODO There's still lots of overlap with the `create` command handler base- move to base class
    protected async persist(instance: TAggregate, command: ICommand): Promise<void> {
        // generate a unique ID for the event
        const eventId = await this.idManager.generate();

        await this.idManager.use(eventId);

        const event = this.eventFactory(command, eventId);

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(event);

        await this.repositoryProvider
            .forResource(this.resourceType)
            .update(instanceToPersistWithUpdatedEventHistory);
    }
}
