import { NonEmptyString } from '@coscrad/data-types';
import { isInternalError } from '../../lib/errors/InternalError';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import { Valid } from '../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../types/AggregateCompositeIdentifier';
import { AggregateId } from '../types/AggregateId';
import { AggregateType } from '../types/AggregateType';
import { HasAggregateId } from '../types/HasAggregateId';
import BaseDomainModel from './BaseDomainModel';
import { BaseEvent } from './shared/events/base-event.entity';

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

    abstract validateInvariants(): ResultOrError<Valid>;

    abstract getAvailableCommands(): string[];

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
