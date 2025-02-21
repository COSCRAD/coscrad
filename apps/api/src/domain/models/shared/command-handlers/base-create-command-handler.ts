import { ICommandBase } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { isNotAvailable } from '../../../../lib/types/not-available';
import { isNotFound } from '../../../../lib/types/not-found';
import { isOK } from '../../../../lib/types/ok';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { EVENT } from '../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../types/AggregateId';
import { Aggregate } from '../../aggregate.entity';
import UuidNotAvailableForUseError from '../common-command-errors/UuidNotAvailableForUseError';
import UuidNotGeneratedInternallyError from '../common-command-errors/UuidNotGeneratedInternallyError';
import { BaseCommandHandler } from './base-command-handler';

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
    protected abstract createNewInstance(command: ICommandBase): ResultOrError<TAggregate>;

    protected createOrFetchWriteContext(command: ICommandBase): Promise<ResultOrError<TAggregate>> {
        return Promise.resolve(this.createNewInstance(command));
    }

    /**
     *
     * When handling a `CREATE_X` command, there is no update to the instance.
     */
    protected actOnInstance(instance: TAggregate): ResultOrError<TAggregate> {
        return instance;
    }

    protected async persist(
        instance: TAggregate,
        command: ICommandBase,
        userId: AggregateId,
        contributorIds: AggregateId[]
    ): Promise<void> {
        /**
         * TODO [https://www.pivotaltracker.com/story/show/182597855]
         *
         * This doesn't feel like the right place to do this. Consider tying
         * this in with the `create` method on the repositories.
         */
        await this.idManager.use(command.aggregateCompositeIdentifier);

        // generate a unique ID for the event
        const eventId = await this.idManager.generate();

        await this.idManager.use({ id: eventId, type: EVENT });

        const event = this.buildEvent(command, {
            id: eventId,
            userId,
            dateCreated: Date.now(),
            contributorIds,
        });

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(event);

        // Persist the valid instance
        await this.getRepositoryForCommand(command)
            .create(instanceToPersistWithUpdatedEventHistory)
            .catch((e) => {
                throw new InternalError(`failed to create new aggregate root in command handler`, [
                    new InternalError(e?.message || 'unknown repository error'),
                ]);
            });

        /**
         * TODO
         * 1. Share this logic with the base-update-command handler
         * 2. Move event publication out of process by pulling events from the
         * command database and publishing via a proper messaging queue.
         */
        this.eventPublisher.publish(event);
    }

    /**
     * Where should we do this? It seems natural to do this as part of the
     * `create` call to the repository.
     */
    protected async validateAdditionalConstraints(
        command: ICommandBase
    ): Promise<ValidationResult> {
        const {
            aggregateCompositeIdentifier: { id: newId },
        } = command;

        // Validate that new ID was generated by our system and is available
        const idStatus = await this.idManager.status(newId);

        if (isNotFound(idStatus)) return new UuidNotGeneratedInternallyError(newId);

        if (isNotAvailable(idStatus))
            // Consider throwing as this is a system error (i.e. exception) and not necessarily a user error
            return new UuidNotAvailableForUseError(newId);

        if (!isOK(idStatus)) {
            // This is out of an abundance of caution. We shouldn't hit this.
            throw new InternalError(`Unrecognized status for id: ${String(idStatus)}`);
        }

        return Valid;
    }
}
