import { InternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { isNotAvailable } from '../../../../lib/types/not-available';
import { isNotFound } from '../../../../lib/types/not-found';
import { isOK } from '../../../../lib/types/ok';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { Aggregate } from '../../aggregate.entity';
import { BaseEvent } from '../events/base-event.entity';
import { BaseCommandHandler } from './base-command-handler';
import { ICreateCommand } from './interfaces/create-command.interface';

interface ISimpleWriteRepository<TAggregate extends Aggregate> {
    create(instance: TAggregate): Promise<void>;
}

/**
 * Extend this class if you'd like some guidance when implementing a new `CREATE_X`
 * command. This class specialize the `CommandHandlerBase` to the `Create` case.
 *
 * Note that if this class overgeneralizes your use case, just implement
 * `ICommandHandler` (i.e. an async `execute` method) in 'free form'.
 */
export abstract class BaseCreateCommandHandler<
    TAggregate extends Aggregate
> extends BaseCommandHandler<TAggregate> {
    protected abstract readonly aggregateType: AggregateType;

    protected abstract readonly repositoryForCommandsTargetAggregate: ISimpleWriteRepository<TAggregate>;

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
        await this.repositoryForCommandsTargetAggregate.create(
            instanceToPersistWithUpdatedEventHistory
        );
    }

    /**
     * Where should we do this? It seems natural to do this as part of the
     * `create` call to the repository.
     */
    protected async validateAdditionalConstraints(
        command: ICreateCommand
    ): Promise<ValidationResult> {
        const { id: newId } = command;

        // Validate that new ID was generated by our system and is available
        const idStatus = await this.idManager.status(newId);

        if (isNotFound(idStatus))
            return new InternalError(
                `The id: ${newId} has not been generated by our ID generation system.`
            );

        if (isNotAvailable(idStatus))
            return new InternalError(
                `The id: ${newId} is already in use by another resource in our system.`
            );

        if (!isOK(idStatus)) {
            // This is out of an abundance of caution. We shouldn't hit this.
            throw new InternalError(`Unrecognized status for id: ${String(idStatus)}`);
        }

        return Valid;
    }
}
