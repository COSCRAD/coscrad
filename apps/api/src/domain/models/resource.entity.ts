import { InternalError } from '../../lib/errors/InternalError';
import capitalizeFirstLetter from '../../lib/utilities/strings/capitalizeFirstLetter';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import formatResourceCompositeIdentifier from '../../view-models/presentation/formatAggregateCompositeIdentifier';
import DisallowedContextTypeForResourceError from '../domainModelValidators/errors/context/invalidContextStateErrors/DisallowedContextTypeForResourceError';
import { Valid } from '../domainModelValidators/Valid';
import { HasAggregateId } from '../types/HasAggregateId';
import { ResourceCompositeIdentifier } from '../types/ResourceCompositeIdentifier';
import { ResourceType } from '../types/ResourceType';
import { Aggregate } from './aggregate.entity';
import { getAllowedContextsForModel } from './allowedContexts/isContextAllowedForGivenResourceType';
import { EdgeConnectionContext } from './context/context.entity';
import { EdgeConnectionContextType } from './context/types/EdgeConnectionContextType';

export abstract class Resource extends Aggregate implements HasAggregateId {
    readonly type: ResourceType;

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    constructor(dto: DTO<Resource>) {
        super(dto);

        // This should only happen in the validation flow
        if (!dto) return;

        this.published = typeof dto.published === 'boolean' ? dto.published : false;
    }

    override getCompositeIdentifier = (): ResourceCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });

    publish<T extends Resource>(this: T): ResultOrError<T> {
        if (this.published)
            return new InternalError(
                `You cannot publish ${formatResourceCompositeIdentifier(
                    this.getCompositeIdentifier()
                )} as it is already published`
            );

        return this.safeClone<T>({
            published: true,
        } as unknown as DeepPartial<DTO<T>>);
    }

    getAllowedContextTypes() {
        return getAllowedContextsForModel(this.type);
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
