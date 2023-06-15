import { ICommandBase } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../lib/errors/types/ValidationResult';
import { isNotAvailable } from '../../../../lib/types/not-available';
import { isNotFound } from '../../../../lib/types/not-found';
import { isOK } from '../../../../lib/types/ok';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import buildAggregateFactory from '../../../factories/buildAggregateFactory';
import { EVENT } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { Aggregate } from '../../aggregate.entity';
import InvalidCommandPayloadTypeError from '../common-command-errors/InvalidCommandPayloadTypeError';
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
    protected abstract readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<TAggregate>;

    // TODO We should be able to get the repository from the `AggregateType`
    protected abstract readonly aggregateType: AggregateType;

    /**
     * The purpose of this method is to adapt the command payload from the
     * command FSA to the domain, and set any default state.
     */
    protected abstract buildCreateDto(command: ICommandBase): DTO<TAggregate>;

    protected createNewInstance(command: ICommandBase): ResultOrError<TAggregate> {
        const createDto = this.buildCreateDto(command);

        return buildAggregateFactory<TAggregate>(this.aggregateType)(createDto);
    }

    /**
     * TODO Remove this in favor of validating the type property using the
     * `@FixedValue` decorator.
     */
    protected validateType(
        command: ICommandBase,
        commandType: string
    ): typeof Valid | InternalError {
        const baseValidationResult = super.validateType(command, commandType);

        const allErrors = isValid(baseValidationResult) ? [] : baseValidationResult.innerErrors;

        if (this.aggregateType !== command?.aggregateCompositeIdentifier?.type)
            allErrors.push(
                new InternalError(
                    `The property type of aggregateCompositeIdentifier has failed validation: must be: ${this.aggregateType}`
                )
            );

        return allErrors.length > 0
            ? new InvalidCommandPayloadTypeError(commandType, allErrors)
            : Valid;
    }

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
        userId: AggregateId
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

        const event = this.buildEvent(command, eventId, userId);

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
        command: ICommandBase
    ): Promise<ValidationResult> {
        const {
            aggregateCompositeIdentifier: { id: newId },
        } = command;

        // Validate that new ID was generated by our system and is available
        const idStatus = await this.idManager.status(newId);

        if (isNotFound(idStatus)) return new UuidNotGeneratedInternallyError(newId);

        if (isNotAvailable(idStatus))
            // Consider throwing as this is a system error (i.e. exception) adn not necessarily a user error
            return new UuidNotAvailableForUseError(newId);

        if (!isOK(idStatus)) {
            // This is out of an abundance of caution. We shouldn't hit this.
            throw new InternalError(`Unrecognized status for id: ${String(idStatus)}`);
        }

        return Valid;
    }
}
