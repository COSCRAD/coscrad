import { ICommandBase } from '@coscrad/api-interfaces';
import { isNotFound } from '../../../../lib/types/not-found';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Aggregate } from '../../aggregate.entity';
import AggregateNotFoundError from '../common-command-errors/AggregateNotFoundError';
import { BaseCommandHandler } from './base-command-handler';

/**
 * Extend this class if you'd like some guidance when implementing a new update
 * command. This class specialize the `CommandHandlerBase` to the `Update` case.
 *
 * Note that if this class overgeneralizes your use case, just implement
 * `ICommandHandler` (i.e. an async `execute` method) in 'free form'.
 */
export abstract class BaseUpdateCommandHandler<
    TAggregate extends Aggregate
> extends BaseCommandHandler<TAggregate> {
    protected async fetchInstanceToUpdate(
        command: ICommandBase
    ): Promise<ResultOrError<TAggregate>> {
        const { id, type: aggregateType } = this.getAggregateIdFromCommand(command);

        const searchResult = await this.getRepositoryForCommand(command).fetchById(id);

        if (isNotFound(searchResult))
            return new AggregateNotFoundError({ type: aggregateType, id });

        return searchResult as ResultOrError<TAggregate>;
    }

    protected createOrFetchWriteContext(command: ICommandBase): Promise<ResultOrError<TAggregate>> {
        return this.fetchInstanceToUpdate(command);
    }

    protected async persistToDatabase(instance: TAggregate): Promise<void> {
        await this.getRepositoryForCommand({
            aggregateCompositeIdentifier: instance.getCompositeIdentifier(),
        }).update(instance);
    }
}
