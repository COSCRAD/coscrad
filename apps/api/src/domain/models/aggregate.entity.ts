import { NonEmptyString } from '@coscrad/data-types';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { ValidationResult } from '../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import InvariantValidationError from '../domainModelValidators/errors/InvariantValidationError';
import validateSimpleInvariants from '../domainModelValidators/utilities/validateSimpleInvariants';
import { isValid, Valid } from '../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../types/AggregateCompositeIdentifier';
import { AggregateId } from '../types/AggregateId';
import { AggregateType } from '../types/AggregateType';
import { DeluxInMemoryStore } from '../types/DeluxInMemoryStore';
import { HasAggregateId } from '../types/HasAggregateId';
import { InMemorySnapshot, isResourceType } from '../types/ResourceType';
import BaseDomainModel from './BaseDomainModel';
import InvalidExternalReferenceByAggregateError from './categories/errors/InvalidExternalReferenceInCategoryError';
import AggregateIdAlraedyInUseError from './shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from './shared/common-command-errors/InvalidExternalStateError';
import { BaseEvent } from './shared/events/base-event.entity';
import not from './shared/functional/common/not';
import getId from './shared/functional/getId';
import idEquals from './shared/functional/idEquals';

export abstract class Aggregate extends BaseDomainModel implements HasAggregateId {
    /**
     * We make this property optional so we don't need to specify it on existing data
     * or test data. If it is not on a DTO, it will be set to [] in the constructor.
     *
     * We do not populate instances of the event- only plain objects (DTOs). In order
     * to use instances, we will need an `EventFactory`.
     */
    readonly eventHistory?: DTO<BaseEvent>[];

    readonly type: AggregateType;

    @NonEmptyString()
    readonly id: AggregateId;

    constructor(dto: DTO<Aggregate>) {
        super();

        // This should only happen in the validation flow
        if (!dto) return;

        this.type = dto.type;

        this.id = dto.id;

        this.eventHistory = Array.isArray(dto.eventHistory)
            ? cloneToPlainObject(dto.eventHistory)
            : [];
    }

    getCompositeIdentifier = (): AggregateCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });

    protected safeClone<T extends Aggregate>(
        this: T,
        updateDto: DeepPartial<DTO<T>>
    ): ResultOrError<T> {
        const updatedInstance = this.clone<T>(updateDto);

        const validationResult = updatedInstance.validateInvariants();

        if (isInternalError(validationResult)) return validationResult;

        return updatedInstance;
    }

    validateInvariants(): ResultOrError<Valid> {
        const simpleValidationResult = validateSimpleInvariants(
            Object.getPrototypeOf(this).constructor,
            this
        );

        const complexValidationResult = this.validateComplexInvariants();

        const allErrors = [...simpleValidationResult, ...complexValidationResult];

        return allErrors.length > 0
            ? new InvariantValidationError(this.getCompositeIdentifier(), allErrors)
            : Valid;
    }

    protected abstract validateComplexInvariants(): InternalError[];

    abstract getAvailableCommands(): string[];

    /**
     * This method should be implemented on each aggregate class to return an array
     * of composite identifiers for every other aggregate that is referred to
     * by composite identifier.
     */
    protected abstract getExternalReferences(): AggregateCompositeIdentifier[];

    validateExternalReferences(externalState: InMemorySnapshot): ValidationResult {
        const invalidReferences = this.getExternalReferences().filter(({ type, id }) =>
            new DeluxInMemoryStore(externalState).fetchAllOfType(type).every(not(idEquals(id)))
        );

        return invalidReferences.length > 0
            ? new InvalidExternalReferenceByAggregateError(this, invalidReferences)
            : Valid;
    }

    validateIdIsUnique(externalState: InMemorySnapshot): InternalError[] {
        const otherAggregatesOfSameType = (
            isResourceType(this.type)
                ? externalState.resources[this.type]
                : externalState[this.type]
        ) as Aggregate[];

        if (!otherAggregatesOfSameType) {
            throw new InternalError(
                `There were no aggregates of type: ${
                    this.type
                } on the provided snapshot: ${JSON.stringify(externalState)}`
            );
        }

        if (otherAggregatesOfSameType.map(getId).includes(this.id))
            return [new AggregateIdAlraedyInUseError(this.getCompositeIdentifier())];

        return [];
    }

    validateExternalState(externalState: InMemorySnapshot): ValidationResult {
        const allErrors = [
            this.validateExternalReferences(externalState),
            ...this.validateIdIsUnique(externalState),
        ].filter((result): result is InternalError => !isValid(result));

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }

    /**
     * The name of this method is a bit misleading. It merely adds an event
     * to the list of historical events without updating the state.
     *
     * At present, we are not doing
     * event sourcing. Rather, the event is created after successfully mutating
     * a model's state and immediately before persisting the result to the database.
     * The event is at present simply a record of a command that has succeeded
     * historically for troubleshooting or migrations (e.g. opt-in to additional
     * raw data from import event).
     */
    addEventToHistory<T extends Aggregate = Aggregate>(this: T, event: BaseEvent) {
        const overrides: DeepPartial<DTO<Aggregate>> = {
            eventHistory: [...cloneToPlainObject(this.eventHistory), event.toDTO()],
        };

        return this.clone<Aggregate>(overrides) as T;
    }
}
