import { ICommand } from '@coscrad/commands';
import { isNotFound } from '../../../../lib/types/not-found';
import { ResultOrError } from '../../../../types/ResultOrError';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import ResourceNotFoundError from '../common-command-errors/ResourceNotFoundError';
import { BaseEvent } from '../events/base-event.entity';
import { BaseCommandHandler } from './base-command-handler';
import { IUpdateCommand } from './interfaces/update-command.interface';

/**
 * Extend this class if you'd like some guidance when implementing a new update
 * command. This class specialize the `CommandHandlerBase` to the `Update` case.
 *
 * Note that if this class overgeneralizes your use case, just implement
 * `ICommandHandler` (i.e. an async `execute` method) in 'free form'.
 */
export abstract class BaseUpdateCommandHandler<
    TAggregate extends Resource
> extends BaseCommandHandler<TAggregate> {
    protected abstract resourceType: ResourceType;

    protected abstract eventFactory(command: ICommand, eventId: AggregateId): BaseEvent;

    protected async fetchInstanceToUpdate({
        id,
    }: IUpdateCommand): Promise<ResultOrError<TAggregate>> {
        const searchResult = await this.repositoryProvider
            .forResource<TAggregate>(this.resourceType)
            .fetchById(id);

        if (isNotFound(searchResult))
            return new ResourceNotFoundError({ type: this.resourceType, id });

        return searchResult;
    }

    protected createOrFetchWriteContext(
        command: IUpdateCommand
    ): Promise<ResultOrError<TAggregate>> {
        return this.fetchInstanceToUpdate(command);
    }

    // TODO There's still lots of overlap with the `create` command handler base- move to base class
    protected async persist(instance: TAggregate, command: IUpdateCommand): Promise<void> {
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
