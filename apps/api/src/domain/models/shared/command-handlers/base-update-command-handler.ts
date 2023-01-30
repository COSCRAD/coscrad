import { ICommandBase } from '@coscrad/api-interfaces';
import { isNotFound } from '../../../../lib/types/not-found';
import { ResultOrError } from '../../../../types/ResultOrError';
import { EVENT } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
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
    protected abstract readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<TAggregate>;

    // TODO We should be able to get the repository from the `AggregateType`
    protected abstract aggregateType: AggregateType;

    private getAggregateIdFromCommand({
        aggregateCompositeIdentifier: { id },
    }: ICommandBase): AggregateId {
        return id;
    }

    protected async fetchInstanceToUpdate(
        command: ICommandBase
    ): Promise<ResultOrError<TAggregate>> {
        const id = this.getAggregateIdFromCommand(command);

        const searchResult = await this.repositoryForCommandsTargetAggregate.fetchById(id);

        if (isNotFound(searchResult))
            return new AggregateNotFoundError({ type: this.aggregateType, id });

        return searchResult;
    }

    protected createOrFetchWriteContext(command: ICommandBase): Promise<ResultOrError<TAggregate>> {
        return this.fetchInstanceToUpdate(command);
    }

    // TODO There's still lots of overlap with the `create` command handler base- move to base class
    protected async persist(
        instance: TAggregate,
        command: ICommandBase,
        systemUserId: AggregateId
    ): Promise<void> {
        // generate a unique ID for the event
        const eventId = await this.idManager.generate();

        await this.idManager.use({ id: eventId, type: EVENT });

        const event = this.buildEvent(command, eventId, systemUserId);

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(event);

        await this.repositoryForCommandsTargetAggregate.update(
            instanceToPersistWithUpdatedEventHistory
        );
    }
}
