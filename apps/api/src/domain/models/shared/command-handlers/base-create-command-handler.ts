import { ResultOrError } from '../../../../types/ResultOrError';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { BaseEvent } from '../events/base-event.entity';
import { BaseCommandHandler } from './base-command-handler';
import { ICreateCommand } from './interfaces/create-command.interface';

/**
 * Extend this class if you'd like some guidance when implementing a new `CREATE_X`
 * command. This class specialize the `CommandHandlerBase` to the `Create` case.
 *
 * Note that if this class overgeneralizes your use case, just implement
 * `ICommandHandler` (i.e. an async `execute` method) in 'free form'.
 */
export abstract class BaseCreateCommandHandler<
    TAggregate extends Resource
> extends BaseCommandHandler<TAggregate> {
    protected abstract readonly resourceType: ResourceType;

    protected abstract createNewInstance(command: ICreateCommand): ResultOrError<TAggregate>;

    protected abstract eventFactory(command: ICreateCommand, eventId: AggregateId): BaseEvent;

    protected createOrFetchWriteContext(
        command: ICreateCommand
    ): Promise<ResultOrError<TAggregate>> {
        return Promise.resolve(this.createNewInstance(command));
    }

    /**
     *
     * When handling a `CREATE_X` command, there is no update to the instance.
     */
    protected actOnInstance(instance: TAggregate): ResultOrError<TAggregate> {
        return instance;
    }

    protected async persist(instance: TAggregate, command: ICreateCommand): Promise<void> {
        /**
         * TODO [https://www.pivotaltracker.com/story/show/182597855]
         *
         * This doesn't feel like the right place to do this. Consider tying
         * this in with the `create` method on the repositories.
         */
        await this.idManager.use(command.id);

        // generate a unique ID for the event
        const eventId = await this.idManager.generate();

        await this.idManager.use(eventId);

        const event = this.eventFactory(command, eventId);

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(event);

        // Persist the valid instance
        await this.repositoryProvider
            .forResource(this.resourceType)
            .create(instanceToPersistWithUpdatedEventHistory);
    }
}
