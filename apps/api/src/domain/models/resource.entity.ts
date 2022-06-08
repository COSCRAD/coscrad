import { InternalError } from '../../lib/errors/InternalError';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import capitalizeFirstLetter from '../../lib/utilities/strings/capitalizeFirstLetter';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';
import DisallowedContextTypeForResourceError from '../domainModelValidators/errors/context/invalidContextStateErrors/DisallowedContextTypeForResourceError';
import { Valid } from '../domainModelValidators/Valid';
import { AggregateId } from '../types/AggregateId';
import { HasAggregateId } from '../types/HasAggregateId';
import { ResourceCompositeIdentifier } from '../types/ResourceCompositeIdentifier';
import { ResourceType } from '../types/ResourceType';
import { getAllowedContextsForModel } from './allowedContexts/isContextAllowedForGivenResourceType';
import BaseDomainModel from './BaseDomainModel';
import { EdgeConnectionContext } from './context/context.entity';
import { EdgeConnectionContextType } from './context/types/EdgeConnectionContextType';

type Event = Record<string, unknown>;

export abstract class Resource extends BaseDomainModel implements HasAggregateId {
    /**
     * We make this property optional so we don't need to specify it on existing data
     * or test data. If it is not on a DTO, it will be set to [] in the constructor.
     */
    readonly events?: Event[];

    readonly type: ResourceType;

    readonly id: AggregateId;

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    constructor(dto: DTO<Resource>) {
        super();

        // This should only happen in the validation flow
        if (!dto) return;

        this.type = dto.type;

        this.id = dto.id;

        this.published = typeof dto.published === 'boolean' ? dto.published : false;

        this.events = Array.isArray(dto.events) ? cloneToPlainObject(dto.events) : [];
    }

    getAllowedContextTypes() {
        return getAllowedContextsForModel(this.type);
    }

    getCompositeIdentifier = (): ResourceCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });

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
    applyEvent<T extends Resource = Resource>(this: T, event: BaseDomainModel) {
        const overrides: DeepPartial<DTO<Resource>> = {
            events: [...cloneToPlainObject(this.events), event.toDTO()],
        };

        return this.clone<Resource>(overrides) as T;
    }

    /**
     * We choose to put the invariant validation in the factory so not to
     * clutter the class with that logic. However, the compatibility between
     * a context model and the resource instance to which it refers depends on the
     * state of the resource. Therefore, this seems like a good place for this kind
     * of validation logic.
     */
    validateContext(context: EdgeConnectionContext): Valid | InternalError {
        const { type } = context;

        if (type === EdgeConnectionContextType.general) return Valid;

        if (!this.getAllowedContextTypes().includes(type)) {
            return new DisallowedContextTypeForResourceError(type, this.getCompositeIdentifier());
        }

        const validator = this[`validate${capitalizeFirstLetter(type)}Context`];

        if (!validator)
            throw new InternalError(
                `${this.type} is missing a validator for context of type: ${type}`
            );

        return validator.apply(this, [context]);
    }
}
