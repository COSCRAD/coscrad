import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandBase,
} from '@coscrad/api-interfaces';
import { Ack, ICommand, ICommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../types/ResultOrError';
import { EVENT_PUBLISHER_TOKEN, ICoscradEventPublisher } from '../../../common/events/interfaces';
import { Valid } from '../../../domainModelValidators/Valid';
import { EVENT, IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../../types/AggregateId';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, isResourceType } from '../../../types/ResourceType';
import { Aggregate } from '../../aggregate.entity';
import InvalidExternalReferenceByAggregateError from '../../categories/errors/InvalidExternalReferenceByAggregateError';
import CommandExecutionError from '../common-command-errors/CommandExecutionError';
import { BaseEvent } from '../events/base-event.entity';
import { EventRecordMetadata } from '../events/types/EventRecordMetadata';
import { buildReferenceTree } from './utilities/build-reference-tree';
import validateCommandPayloadType from './utilities/validateCommandPayloadType';

const buildExecutionError = (allErrors: InternalError[]) => new CommandExecutionError(allErrors);

export type CoscradCommandMeta = Pick<EventRecordMetadata, 'userId'> & {
    contributorIds?: AggregateId[];
};

interface HasAggregateCompositeIdentifier {
    [AGGREGATE_COMPOSITE_IDENTIFIER]: AggregateCompositeIdentifier;
}

export abstract class BaseCommandHandler<TAggregate extends Aggregate> implements ICommandHandler {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager,
        @Inject(EVENT_PUBLISHER_TOKEN) protected readonly eventPublisher: ICoscradEventPublisher
    ) {}

    protected getAggregateIdFromCommand({
        aggregateCompositeIdentifier,
    }: ICommandBase): AggregateCompositeIdentifier {
        return aggregateCompositeIdentifier;
    }

    protected getRepositoryForCommand<T extends Aggregate = Aggregate>(
        command: HasAggregateCompositeIdentifier
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

        if (aggregateType === AggregateType.contributor) {
            return this.repositoryProvider.getContributorRepository() as unknown as IRepositoryForAggregate<T>;
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

    // can we make this `buildEvents` now?
    protected abstract buildEvent(
        // Make this base event payload
        payload: ICommand,
        eventMeta: EventRecordMetadata
    ): BaseEvent;

    protected abstract persistToDatabase(instance: TAggregate): Promise<void>;

    protected async persist(
        instance: TAggregate,
        command: ICommandBase,
        userId: AggregateId,
        contributorIds: AggregateId[]
    ): Promise<void> {
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
        await this.persistToDatabase(instanceToPersistWithUpdatedEventHistory);

        /**
         * TODO
         * 1. Share this logic with the base-update-command handler
         * 2. Move event publication out of process by pulling events from the
         * command database and publishing via a proper messaging queue.
         */
        this.eventPublisher.publish(event);
    }

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

    private validateReferences(
        command: ICommandBase,
        snapshot: InMemorySnapshot
    ): ValidationResult {
        const CommandCtor: Object = Object.getPrototypeOf(command).constructor;

        const unmatchedCompositeIdentifiers = new DeluxeInMemoryStore(snapshot)
            .fetchReferences()
            .compare(buildReferenceTree(CommandCtor, command));

        return unmatchedCompositeIdentifiers.length > 0
            ? new InvalidExternalReferenceByAggregateError(
                  command[AGGREGATE_COMPOSITE_IDENTIFIER],
                  unmatchedCompositeIdentifiers as AggregateCompositeIdentifier[]
              )
            : Valid;
    }

    async execute(
        command: ICommandBase,
        commandType: string,
        { userId, contributorIds }: CoscradCommandMeta
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

        // Can we combine this with fetching the write context for performance and atomicity.
        const externalState = await this.fetchRequiredExternalState(command);

        const referenceValidationResult = this.validateReferences(command, externalState);

        if (isInternalError(referenceValidationResult))
            return buildExecutionError([referenceValidationResult]);

        const externalStateValidationResult = this.validateExternalState(
            externalState,
            updatedInstance
        );

        if (isInternalError(externalStateValidationResult))
            return buildExecutionError([externalStateValidationResult]);

        const additionalValidationResult = await this.validateAdditionalConstraints(command);

        if (isInternalError(additionalValidationResult))
            return buildExecutionError([additionalValidationResult]);

        await this.persist(updatedInstance, command, userId, contributorIds || []);

        return Ack;
    }
}
