import { AggregateCompositeIdentifier, AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Ack, ICommand, ICommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../../types/AggregateId';
import { InMemorySnapshot, isResourceType } from '../../../types/ResourceType';
import { Aggregate } from '../../aggregate.entity';
import CommandExecutionError from '../common-command-errors/CommandExecutionError';
import { BaseEvent } from '../events/base-event.entity';
import { EventRecordMetadata } from '../events/types/EventRecordMetadata';
import validateCommandPayloadType from './utilities/validateCommandPayloadType';

const buildExecutionError = (allErrors: InternalError[]) => new CommandExecutionError(allErrors);

export abstract class BaseCommandHandler<TAggregate extends Aggregate> implements ICommandHandler {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {}

    protected getAggregateIdFromCommand({
        aggregateCompositeIdentifier,
    }: ICommandBase): AggregateCompositeIdentifier {
        return aggregateCompositeIdentifier;
    }

    protected getRepositoryForCommand<T extends Aggregate = Aggregate>(
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

    protected validateType(command: ICommand, commandType: string): Valid | InternalError {
        return validateCommandPayloadType(command, commandType);
    }

    protected abstract createOrFetchWriteContext(
        command: ICommand
    ): Promise<ResultOrError<TAggregate>>;

    protected abstract fetchRequiredExternalState(command?: ICommand): Promise<InMemorySnapshot>;

    // TODO Consider putting this on the instance (e.g. an `applyCommand(type,payload)` method)
    protected abstract actOnInstance(
        instance: TAggregate,
        command: ICommand
    ): ResultOrError<TAggregate>;

    // TODO Put this on the Aggregate classes
    protected abstract validateExternalState(
        state: InMemorySnapshot,
        instance: TAggregate
    ): Valid | InternalError;

    protected abstract buildEvent(
        command: ICommand,
        eventId: AggregateId,
        userId: AggregateId
    ): BaseEvent;

    protected abstract persist(
        instance: TAggregate,
        command: ICommand,
        userId: AggregateId
    ): Promise<void>;

    /**
     * This is a catch-all in case there's some presently unforeseen validation
     * that needs to be done.
     */
    protected async validateAdditionalConstraints(
        _: ICommand,
        __?: InMemorySnapshot
    ): Promise<Valid | InternalError> {
        return Valid;
    }

    async execute(
        command: ICommand,
        commandType: string,
        { userId }: Pick<EventRecordMetadata, 'userId'>
    ): Promise<Ack | InternalError> {
        const typeValidationResult = this.validateType(command, commandType);

        if (isInternalError(typeValidationResult)) {
            return typeValidationResult;
        }

        const writeContextInstance = await this.createOrFetchWriteContext(command);

        if (isInternalError(writeContextInstance))
            return buildExecutionError([writeContextInstance]);

        const updatedInstance = this.actOnInstance(writeContextInstance, command);

        if (isInternalError(updatedInstance)) return buildExecutionError([updatedInstance]);

        // Can we combine this with fetching the write context for performance?
        const externalState = await this.fetchRequiredExternalState(command);

        const externalStateValidationResult = this.validateExternalState(
            externalState,
            updatedInstance
        );

        if (isInternalError(externalStateValidationResult))
            return buildExecutionError([externalStateValidationResult]);

        const additionalValidationResult = await this.validateAdditionalConstraints(command);

        if (isInternalError(additionalValidationResult))
            return buildExecutionError([additionalValidationResult]);

        await this.persist(updatedInstance, command, userId);

        return Ack;
    }
}
