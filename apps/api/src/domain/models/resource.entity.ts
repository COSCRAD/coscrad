import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { InternalError } from '../../lib/errors/InternalError';
import capitalizeFirstLetter from '../../lib/utilities/strings/capitalizeFirstLetter';
import { Valid } from '../domainModelValidators/Valid';
import { EntityId } from '../types/ResourceId';
import { ResourceType } from '../types/resourceTypes';
import { getAllowedContextsForModel } from './allowedContexts/isContextAllowedForGivenResourceType';
import BaseDomainModel from './BaseDomainModel';
import { ContextModelUnion } from './context/types/ContextModelUnion';
import { EdgeConnectionContextType } from './context/types/EdgeConnectionContextType';
import { ResourceCompositeIdentifier } from './types/entityCompositeIdentifier';

export abstract class Resource extends BaseDomainModel {
    readonly type: ResourceType;

    readonly id: EntityId;

    readonly allowedContextTypes: EdgeConnectionContextType[];

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    constructor(dto: PartialDTO<Resource>) {
        super();

        this.type = dto.type;

        this.id = dto.id;

        this.published = typeof dto.published === 'boolean' ? dto.published : false;

        this.allowedContextTypes = getAllowedContextsForModel(this.type);
    }

    getCompositeIdentifier = (): ResourceCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });

    /**
     * We choose to put the invariant validation in the factory so not to
     * clutter the class with that logic. However, the compatibility between
     * a context model and the resource instance to which it refers depends on the
     * state of the resource. Therefore, this seems like a good place for this logic.
     */
    validateContext(context: ContextModelUnion): Valid | InternalError {
        const { type } = context;

        if (!this.allowedContextTypes.includes(type))
            return new InternalError(`Disallowed context type for ${this.type}: ${type}`);

        const validator = this[`validate${capitalizeFirstLetter(type)}Context`];

        if (!validator)
            throw new InternalError(
                `${this.type} is missing a validator for context of type: ${type}`
            );

        return validator.apply(this, [context]);
    }
}
