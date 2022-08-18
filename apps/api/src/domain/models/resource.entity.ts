import { InternalError } from '../../lib/errors/InternalError';
import capitalizeFirstLetter from '../../lib/utilities/strings/capitalizeFirstLetter';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';
import { ResultOrError } from '../../types/ResultOrError';
import formatResourceCompositeIdentifier from '../../view-models/presentation/formatAggregateCompositeIdentifier';
import DisallowedContextTypeForResourceError from '../domainModelValidators/errors/context/invalidContextStateErrors/DisallowedContextTypeForResourceError';
import { Valid } from '../domainModelValidators/Valid';
import { AggregateId } from '../types/AggregateId';
import { HasAggregateId } from '../types/HasAggregateId';
import { ResourceCompositeIdentifier } from '../types/ResourceCompositeIdentifier';
import { ResourceType } from '../types/ResourceType';
import { Aggregate } from './aggregate.entity';
import { getAllowedContextsForModel } from './allowedContexts/isContextAllowedForGivenResourceType';
import { EdgeConnectionContext } from './context/context.entity';
import { EdgeConnectionContextType } from './context/types/EdgeConnectionContextType';
import { AccessControlList } from './shared/access-control/access-control-list.entity';
import UserAlreadyHasReadAccessError from './shared/common-command-errors/invalid-state-transition-errors/UserAlreadyHasReadAccessError';

export abstract class Resource extends Aggregate implements HasAggregateId {
    readonly type: ResourceType;

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    /**
     * TODO We need a migration to make the acl required. We'll also need to
     * populate this on all test data.
     */
    readonly queryAccessControlList?: AccessControlList;

    constructor(dto: DTO<Resource>) {
        super(dto);

        // This should only happen in the validation flow
        if (!dto) return;

        const { published, queryAccessControlList: aclDto } = dto;

        this.published = typeof published === 'boolean' ? published : false;

        this.queryAccessControlList = new AccessControlList(aclDto);
    }

    override getCompositeIdentifier = (): ResourceCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });

    grantReadAccessToUser<T extends Resource>(this: T, userId: AggregateId): ResultOrError<T> {
        if (this.queryAccessControlList.canUser(userId))
            return new UserAlreadyHasReadAccessError(userId, this.getCompositeIdentifier());

        return this.safeClone({
            queryAccessControlList: this.queryAccessControlList.allowUser(userId),
        } as DeepPartial<DTO<T>>);
    }

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
     * Validates that the state of an `EdgeConnectionContext` instance used
     * to contextualize this resource instance is in fact consistent with the state
     * of this resource.
     */
    validateContext(context: EdgeConnectionContext): Valid | InternalError {
        const { type } = context;

        if (type === EdgeConnectionContextType.general) return Valid;

        if (!this.getAllowedContextTypes().includes(type)) {
            return new DisallowedContextTypeForResourceError(type, this.getCompositeIdentifier());
        }

        // There is no state to validate here.
        if (type === EdgeConnectionContextType.identity) return Valid;

        const validator = this[`validate${capitalizeFirstLetter(type)}Context`];

        if (!validator)
            throw new InternalError(
                `${this.type} is missing a validator for context of type: ${type}`
            );

        return validator.apply(this, [context]);
    }

    protected abstract getResourceSpecificAvailableCommands(): string[];

    /**
     * The following returns a list of command types for all commands generic
     * to any resource type that are currently available based on the resource
     * isntance's state.
     */
    private getAvailableGenericCommands(): string[] {
        return ['GRANT_RESOURCE_READ_ACCESS_TO_USER'];
    }

    getAvailableCommands(): string[] {
        return [
            ...this.getResourceSpecificAvailableCommands(),
            ...this.getAvailableGenericCommands(),
        ];
    }
}
