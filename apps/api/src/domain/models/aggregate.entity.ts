import { NonEmptyString } from '@coscrad/data-types';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { ValidationResult } from '../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../types/DTO';
import { DeepPartial } from '../../types/DeepPartial';
import { ResultOrError } from '../../types/ResultOrError';
import { MultilingualText, MultilingualTextItem } from '../common/entities/multilingual-text';
import { Valid, isValid } from '../domainModelValidators/Valid';
import InvariantValidationError from '../domainModelValidators/errors/InvariantValidationError';
import validateSimpleInvariants from '../domainModelValidators/utilities/validateSimpleInvariants';
import { AggregateCompositeIdentifier } from '../types/AggregateCompositeIdentifier';
import { AggregateId } from '../types/AggregateId';
import { AggregateType } from '../types/AggregateType';
import { DeluxeInMemoryStore } from '../types/DeluxeInMemoryStore';
import { HasAggregateId } from '../types/HasAggregateId';
import { InMemorySnapshot, isResourceType } from '../types/ResourceType';
import BaseDomainModel from './BaseDomainModel';
import InvalidExternalReferenceByAggregateError from './categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateIdAlreadyInUseError from './shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from './shared/common-command-errors/InvalidExternalStateError';
import { BaseEvent } from './shared/events/base-event.entity';
import not from './shared/functional/common/not';
import getId from './shared/functional/getId';
import idEquals from './shared/functional/idEquals';

// TODO Rename this `AggregateRoot` to avoid confusion.
export abstract class Aggregate extends BaseDomainModel implements HasAggregateId {
    /**
     * We make this property optional so we don't need to specify it on existing data
     * or test data. If it is not on a DTO, it will be set to [] in the constructor.
     *
     * We do not populate instances of the event- only plain objects (DTOs). In order
     * to use instances, we will need an `EventFactory`.
     */
    readonly eventHistory?: BaseEvent[];

    readonly type: AggregateType;

    // TODO Make this a UUID
    @NonEmptyString({
        label: 'ID',
        description: 'unique identifier',
    })
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

    getCompositeIdentifier<T extends Aggregate>(
        this: T
    ): {
        type: T['type'];
        id: AggregateId;
    } {
        return {
            type: this.type,
            id: this.id,
        };
    }

    public safeClone<T extends Aggregate>(
        this: T,
        updateDto: DeepPartial<DTO<T>>
    ): ResultOrError<T> {
        const updatedInstance = this.clone<T>(updateDto);

        const validationResult = updatedInstance.validateInvariants();

        if (isInternalError(validationResult)) return validationResult;

        return updatedInstance;
    }

    /**
     * Invariant validation ensures that it is not possible for an invalid
     * (poorly formed) aggregate root to enter our system. We identify inconsistencies
     * at the boundaries of our system. We call `validateInvariants` after building
     * a new instance in the domain model factories. It's crucial that we use the
     * factories when receiving a DTO from the database or from mapping a command
     * payload (user input) to a create DTO for a create command.
     *
     * Note that failed invariant validation in the repository layer (when the DTO
     * is coming from existing state in the database) is a system error, but we
     * check for it none the less. This is why all fetch methods on our repositories
     * return a `ResultOrError`. The most likely way to end up with invalid state
     * in the database is after a database migration. For this reason, there is a
     * post-op for each migration that runs and reports on the invariant validation
     * status for every aggregate.
     *
     * In our system, invariant validation rules fall into 2 classes:
     * **Simple Invariants** are rules that can be verified by looking at the value
     * of one property alone. For example `count` might be required to be a
     * non-negative finite integer. These constraints are defined using `@coscrad/data-types`
     * property decorators. No methods need to be implemented manually. Note that
     * these constraints could be deferred to the database by syncing the
     * schema with our type decorators. We have elected not to do this as it is
     * more hastle than it is worth when using a document store.
     *
     * **Complex Invariants** are interesting business rules. They require looking
     * at multiple properties in combination. For example, we might require
     * that a playlist cannot have the state `published=true` when it does not
     * have any items. Or we might require that only one of `foo` and `bar` has a
     * defined value, but not both. When implementing a new aggregate (root) class,
     * you must implement `validateComplexInvariants` to specify this logic. The
     * simple invariant validation will be mixed in for you.
     */
    validateInvariants(): ResultOrError<Valid> {
        const simpleValidationResult = validateSimpleInvariants(
            Object.getPrototypeOf(this).constructor,
            this
        );

        /**
         * If simple invariant validation fails, the instance is ill-formed,
         * and we would likely run into null check errors or other unexpected
         * run-time issues when attempting to validate complex invariants. So
         * we return early when simple invariant validation fails.
         */
        if (simpleValidationResult.length > 0)
            return new InvariantValidationError(
                this.getCompositeIdentifier(),
                simpleValidationResult
            );

        const complexValidationResult = this.validateComplexInvariants();

        return complexValidationResult.length > 0
            ? new InvariantValidationError(this.getCompositeIdentifier(), complexValidationResult)
            : Valid;
    }

    protected abstract validateComplexInvariants(): InternalError[];

    abstract getAvailableCommands(): string[];

    /**
     * It's important that every aggregate has a name to display to the user.
     * However, it may be the case that
     * - the property isn't naturally called name on the given aggregate model
     * - the name needs to be calculated from multiple properties
     *
     * So to keep things general, we expose a function for getting the name.
     * this is used in the view layer to build a `name` property for every
     * aggregate view.
     */
    abstract getName(): MultilingualText;

    // TODO add typesafety for `propertyName`
    protected translateMultilingualTextProperty(
        propertyName: string,
        translationInfo: DTO<MultilingualTextItem>
    ): ResultOrError<this> {
        const propertyValue = this[propertyName];

        if (!(propertyValue instanceof MultilingualText)) {
            throw new InternalError(
                `Failed to translate property: ${propertyValue}, as it is not of type MultilingualText`
            );
        }

        const valueUpdateResult = propertyValue.translate(translationInfo);

        if (isInternalError(valueUpdateResult)) return valueUpdateResult;

        return this.safeClone({
            [propertyName]: valueUpdateResult,
        } as unknown as DeepPartial<DTO<this>>);
    }

    /**
     * This method should be implemented on each aggregate class to return an array
     * of composite identifiers for every other aggregate that is referred to
     * by composite identifier.
     */
    protected abstract getExternalReferences(): AggregateCompositeIdentifier[];

    validateExternalReferences(externalState: InMemorySnapshot): ValidationResult {
        const invalidReferences = this.getExternalReferences().filter(({ type, id }) =>
            new DeluxeInMemoryStore(externalState).fetchAllOfType(type).every(not(idEquals(id)))
        );

        if (invalidReferences.length > 0) {
            return new InvalidExternalReferenceByAggregateError(
                this.getCompositeIdentifier(),
                invalidReferences
            );
        }

        return Valid;
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
            return [new AggregateIdAlreadyInUseError(this.getCompositeIdentifier())];

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

    /**
     * We use convention over configuration here so to avoid the need for yet
     * another layer of complicated decorators \ metadata.
     */
    apply<T extends Aggregate = Aggregate>(this: T, event: BaseEvent): ResultOrError<T> {
        if (!event.isFor(this.getCompositeIdentifier())) return this;

        const eventCtorName = Object.getPrototypeOf(event).constructor.name;

        /**
         * Note that `handleLyricsAddedForSong` reads better than
         * `handle_LYRICS_ADDED_FOR_SONG`;
         */
        const handlerMethodName = `handle${eventCtorName}`;

        if (typeof this[handlerMethodName] !== 'function') {
            /**
             * Should we throw here?
             */
            return this;
        }

        return this[handlerMethodName](event);
    }
}
