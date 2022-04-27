import { DTO } from 'apps/api/src/types/DTO';
import { InternalError } from '../../lib/errors/InternalError';
import capitalizeFirstLetter from '../../lib/utilities/strings/capitalizeFirstLetter';
import DisallowedContextTypeForResourceError from '../domainModelValidators/errors/context/invalidContextStateErrors/DisallowedContextTypeForResourceError';
import { Valid } from '../domainModelValidators/Valid';
import { EntityId } from '../types/ResourceId';
import { ResourceType } from '../types/resourceTypes';
import { getAllowedContextsForModel } from './allowedContexts/isContextAllowedForGivenResourceType';
import BaseDomainModel from './BaseDomainModel';
import { EdgeConnectionContext } from './context/context.entity';
import { EdgeConnectionContextType } from './context/types/EdgeConnectionContextType';
import { ResourceCompositeIdentifier } from './types/entityCompositeIdentifier';
import { HasEntityID } from './types/HasEntityId';

export abstract class Resource extends BaseDomainModel implements HasEntityID {
    readonly type: ResourceType;

    readonly id: EntityId;

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    constructor(dto: DTO<Resource>) {
        super();

        this.type = dto.type;

        this.id = dto.id;

        this.published = typeof dto.published === 'boolean' ? dto.published : false;
    }

    getAllowedContextTypes() {
        return getAllowedContextsForModel(this.type);
    }

    getCompositeIdentifier = (): ResourceCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });

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
