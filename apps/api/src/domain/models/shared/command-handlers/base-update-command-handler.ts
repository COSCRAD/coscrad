import {
    AggregateCompositeIdentifier,
    ICommandBase,
    isResourceType,
} from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
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
    private getAggregateIdFromCommand({
        aggregateCompositeIdentifier,
    }: ICommandBase): AggregateCompositeIdentifier {
        return aggregateCompositeIdentifier;
    }

    private getRepositoryForCommand<T extends Aggregate = Aggregate>(
        command: ICommandBase
    ): IRepositoryForAggregate<T> {
        const { type: aggregateType } = this.getAggregateIdFromCommand(command);

        // TODO a `forAggregate` method on the repository provider would be better
        if (isResourceType(aggregateType))
            return this.repositoryProvider.forResource(
                aggregateType
            ) as unknown as IRepositoryForAggregate<T>;

        if (aggregateType === AggregateType.note)
            return this.repositoryProvider.getEdgeConnectionRepository() as unknown as IRepositoryForAggregate<T>;

        if (aggregateType === AggregateType.user)
            return this.repositoryProvider.getUserRepository() as unknown as IRepositoryForAggregate<T>;

        if (aggregateType === AggregateType.userGroup)
            return this.repositoryProvider.getUserGroupRepository() as unknown as IRepositoryForAggregate<T>;

        if (aggregateType === AggregateType.tag)
            return this.repositoryProvider.getTagRepository() as unknown as IRepositoryForAggregate<T>;

        if (aggregateType === AggregateType.category) {
            throw new InternalError(
                `Category Repository is not supported as it doesn not have an update method`
            );
        }

        const exhaustiveCheck: never = aggregateType;

        throw new InternalError(
            `Failed to find repository for aggregate of type: ${exhaustiveCheck}`
        );
    }

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

        await this.getRepositoryForCommand(command).update(
            instanceToPersistWithUpdatedEventHistory
        );
    }
}
