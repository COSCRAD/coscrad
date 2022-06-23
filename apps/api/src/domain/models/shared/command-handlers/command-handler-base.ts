import { Ack, ICommand, ICommandHandler } from '@coscrad/commands';
import { buildSimpleValidationFunction } from '@coscrad/validation';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { InMemorySnapshot } from '../../../types/ResourceType';
import InvalidCommandPayloadTypeError from '../common-command-errors/InvalidCommandPayloadTypeError';

export abstract class CommandHandlerBase<TAggregate> implements ICommandHandler {
    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {}

    protected validateType(command: ICommand, commandType: string): Valid | InternalError {
        // Validate command type
        const payloadTypeErrors = buildSimpleValidationFunction(
            Object.getPrototypeOf(command).constructor
        )(command).map(
            (simpleError) => new InternalError(`invalid payload type: ${simpleError.toString()}`)
        );

        if (payloadTypeErrors.length > 0) {
            // TODO PAss through the command type
            return new InvalidCommandPayloadTypeError(commandType, payloadTypeErrors);
        }

        return Valid;
    }

    abstract createOrFetchWriteContext(command: ICommand): Promise<ResultOrError<TAggregate>>;

    abstract fetchRequiredExternalState(): Promise<InMemorySnapshot>;

    // TODO Consider putting this on the instance (e.g. an `applyCommand(type,payload)` method)
    abstract actOnInstance(instance: TAggregate): ResultOrError<TAggregate>;

    // TODO Put this on the Aggregate classes
    abstract validateExternalState(
        state: InMemorySnapshot,
        instance: TAggregate
    ): Valid | InternalError;

    abstract persist(instance: TAggregate, command: ICommand): Promise<void>;

    /**
     * This is a catch-all in case there's some presently unforeseen validation
     * that needs to be done.
     */
    protected async validateAdditionalConstraints(_: ICommand): Promise<Valid | InternalError> {
        return Valid;
    }

    async execute(command: ICommand, commandType: string): Promise<Ack | InternalError> {
        const typeValidationResult = this.validateType(command, commandType);

        if (isInternalError(typeValidationResult)) return typeValidationResult;

        const writeContextInstance = await this.createOrFetchWriteContext(command);

        if (isInternalError(writeContextInstance)) return writeContextInstance;

        const updatedInstance = this.actOnInstance(writeContextInstance);

        if (isInternalError(updatedInstance)) return updatedInstance;

        // Can we combine this with fetching the write context for performance?
        const externalState = await this.fetchRequiredExternalState();

        const externalStateValidationResult = this.validateExternalState(
            externalState,
            updatedInstance
        );

        if (isInternalError(externalStateValidationResult)) return externalStateValidationResult;

        const additionalValidationResult = await this.validateAdditionalConstraints(command);

        if (isInternalError(additionalValidationResult)) return additionalValidationResult;

        await this.persist(updatedInstance, command);

        return Ack;
    }
}
