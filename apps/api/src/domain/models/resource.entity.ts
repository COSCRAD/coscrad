import { InternalError } from '../../lib/errors/InternalError';
import capitalizeFirstLetter from '../../lib/utilities/strings/capitalizeFirstLetter';
import { DTO } from '../../types/DTO';
import { DeepPartial } from '../../types/DeepPartial';
import { ResultOrError } from '../../types/ResultOrError';
import { UpdateMethod } from '../decorators';
import { Valid } from '../domainModelValidators/Valid';
import DisallowedContextTypeForResourceError from '../domainModelValidators/errors/context/invalidContextStateErrors/DisallowedContextTypeForResourceError';
import { AggregateId } from '../types/AggregateId';
import { ResourceType } from '../types/ResourceType';
import { Aggregate } from './aggregate.entity';
import { getAllowedContextsForModel } from './allowedContexts/isContextAllowedForGivenResourceType';
import { EdgeConnectionContext } from './context/context.entity';
import { EdgeConnectionContextType } from './context/types/EdgeConnectionContextType';
import ResourceAlreadyPublishedError from './resource-already-published.error';
import ResourceNotYetPublishedError from './resource-not-yet-published.error';
import { AccessControlList } from './shared/access-control/access-control-list.entity';
import UserAlreadyHasReadAccessError from './shared/common-command-errors/invalid-state-transition-errors/UserAlreadyHasReadAccessError';
import { ResourceReadAccessGrantedToUser } from './shared/common-commands';

// TODO rename files in this directory
export abstract class Resource extends Aggregate {
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

    grantReadAccessToUser<T extends Resource>(this: T, userId: AggregateId): ResultOrError<T> {
        if (this.queryAccessControlList.canUser(userId))
            return new UserAlreadyHasReadAccessError(userId, this.getCompositeIdentifier());

        return this.safeClone({
            queryAccessControlList: this.queryAccessControlList.allowUser(userId),
        } as DeepPartial<DTO<T>>);
    }

    handleResourceReadAccessGrantedToUser<T extends Resource>(
        this: T,
        { payload: { userId } }: ResourceReadAccessGrantedToUser
    ) {
        return this.grantReadAccessToUser(userId);
    }

    @UpdateMethod()
    publish<T extends Resource>(this: T): ResultOrError<T> {
        if (this.published) return new ResourceAlreadyPublishedError(this.getCompositeIdentifier());

        return this.safeClone<T>({
            published: true,
        } as unknown as DeepPartial<DTO<T>>);
    }

    @UpdateMethod()
    unpublish<T extends Resource>(this: T): ResultOrError<T> {
        if (!this.published) return new ResourceNotYetPublishedError(this.getCompositeIdentifier());

        return this.safeClone<T>({
            published: false,
        } as unknown as DeepPartial<DTO<T>>);
    }

    handleResourcePublished<T extends Resource>(this: T) {
        return this.publish<T>();
    }

    // TODO add test coverage
    handleResourceUnpublished<T extends Resource>(this: T) {
        return this.unpublish<T>();
    }

    getAllowedContextTypes() {
        return getAllowedContextsForModel(this.type);
    }

    getContributions(): {
        type: string;
        contributorIds: string[];
        date: number;
    }[] {
        return this.eventHistory.map(({ type, meta: { contributorIds, dateCreated } }) => ({
            type,
            contributorIds,
            date: dateCreated,
        }));
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
     * instance's state.
     */
    private getAvailableGenericCommands(): string[] {
        const alwaysAvailable = [`GRANT_RESOURCE_READ_ACCESS_TO_USER`];

        return [...alwaysAvailable, ...(this.published ? [] : ['PUBLISH_RESOURCE'])];
    }

    getAvailableCommands(): string[] {
        return [
            ...this.getResourceSpecificAvailableCommands(),
            ...this.getAvailableGenericCommands(),
        ];
    }
}
