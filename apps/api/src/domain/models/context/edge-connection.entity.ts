import {
    CompositeIdentifier,
    CoscradEnum,
    Enum,
    ExternalEnum,
    NestedDataType,
    NonEmptyString,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { Valid, isValid } from '../../domainModelValidators/Valid';
import validateEdgeConnection from '../../domainModelValidators/contextValidators/validateEdgeConnection';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../types/AggregateType';
import { ResourceCompositeIdentifier } from '../../types/ResourceCompositeIdentifier';
import { InMemorySnapshot, ResourceType, isResourceType } from '../../types/ResourceType';
import BaseDomainModel from '../BaseDomainModel';
import { Aggregate } from '../aggregate.entity';
import { Resource } from '../resource.entity';
import AggregateIdAlreadyInUseError from '../shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import idEquals from '../shared/functional/idEquals';
import { EdgeConnectionContext } from './context.entity';

export { isEdgeConnectionType } from '@coscrad/api-interfaces';
export { EdgeConnectionMemberRole, EdgeConnectionType, IEdgeConnectionMember };

import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IEdgeConnectionMember,
} from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import formatAggregateCompositeIdentifier from '../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';
import AggregateNotFoundError from '../shared/common-command-errors/AggregateNotFoundError';
import { ContextUnion } from './edge-connection-context-union';

export class EdgeConnectionMember<T extends EdgeConnectionContext = EdgeConnectionContext>
    extends BaseDomainModel
    implements IEdgeConnectionMember
{
    @CompositeIdentifier(ResourceType, isResourceType, {
        label: 'composite identifier',
        description: "composite identifier of the members's resource",
    })
    readonly compositeIdentifier: ResourceCompositeIdentifier;

    @ContextUnion({
        label: 'context',
        description: 'contextualizes the note or connection for this member',
    })
    context: T;

    @Enum(CoscradEnum.EdgeConnectionMemberRole, {
        label: 'role',
        description: 'is',
    })
    role: EdgeConnectionMemberRole;

    constructor(dto: DTO<EdgeConnectionMember>) {
        super();

        if (!dto) return;

        const { compositeIdentifier, context, role } = dto;

        this.compositeIdentifier = cloneToPlainObject(compositeIdentifier);

        /**
         * TODO Do we need this to be an instance instead of a DTO? If so, we
         * need a context factory.
         */
        this.context = cloneToPlainObject(context);

        this.role = role;
    }
}

@Injectable()
@RegisterIndexScopedCommands([])
export class EdgeConnection extends Aggregate {
    type = AggregateType.note;

    @ExternalEnum(
        {
            enumName: 'EdgeConnectionType',
            enumLabel: 'Edge Connection Type',
            labelsAndValues: [
                {
                    label: 'note',
                    value: EdgeConnectionType.self,
                },
                {
                    label: 'connection',
                    value: EdgeConnectionType.dual,
                },
            ],
        },
        {
            label: 'type',
            description: 'either note or connection',
        }
    )
    connectionType: EdgeConnectionType;

    @NestedDataType(EdgeConnectionMember, {
        isArray: true,
        label: 'members',
        description: 'the resource for the note or the resources involved in the connection',
    })
    readonly members: EdgeConnectionMember[];

    @NonEmptyString({
        label: 'note text',
        description: 'text summary of why this connection is relevant',
    })
    readonly note: string;

    constructor(dto: DTO<EdgeConnection>) {
        super(dto);

        if (!dto) return;

        const { members, note, connectionType: type } = dto;

        this.connectionType = type;

        this.members = members.map((dto) => new EdgeConnectionMember(dto));

        this.note = note;
    }

    getName(): MultilingualText {
        if (this.connectionType === EdgeConnectionType.self)
            return buildMultilingualTextWithSingleItem(
                `A note about ${formatAggregateCompositeIdentifier(
                    this.members[0].compositeIdentifier
                )}`
            );

        // We have a dual Edge Connection
        const toMemberCompositeIdentifier = this.members.find(
            ({ role }) => role === EdgeConnectionMemberRole.to
        ).compositeIdentifier;

        const fromMemberCompositeIdentifier = this.members.find(
            ({ role }) => role === EdgeConnectionMemberRole.from
        ).compositeIdentifier;

        return buildMultilingualTextWithSingleItem(
            `A connection from ${formatAggregateCompositeIdentifier(
                fromMemberCompositeIdentifier
            )} to ${formatAggregateCompositeIdentifier(toMemberCompositeIdentifier)}`
        );
    }

    private validateMembersState({ resources }: InMemorySnapshot): InternalError[] {
        return this.members
            .map(({ compositeIdentifier: { type, id }, context }) => ({
                resource:
                    (resources[type] as Resource[]).find((resource) => resource.id === id) ||
                    new AggregateNotFoundError({ type, id }),
                context,
            }))
            .map(({ resource, context }) => {
                if (isInternalError(resource)) return resource;

                return resource.validateContext(context);
            })
            .filter((result): result is InternalError => !isValid(result));
    }

    validateExternalState(externalState: InMemorySnapshot): ValidationResult {
        const { note: connections } = externalState;

        const allErrors: InternalError[] = [];

        if (connections.some(idEquals(this.id)))
            allErrors.push(new AggregateIdAlreadyInUseError(this.getCompositeIdentifier()));

        const inconsistentStateErrorsFromMembers = this.validateMembersState(externalState);

        allErrors.push(...inconsistentStateErrorsFromMembers);

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;

        /**
         * Currently, every `BibliographicReference` sub-type can participate
         * in an identity connection with a `Book` and no other resource. We can
         * verify this as part of invariant validation.
         *
         * As we introduce additional subtypes of `BibliographicReference`, we
         * will need to validate that the sub-type of BibliographicReference
         * in a `from` member for an identity connection is consistent with the
         * `ResourceType` of the `to` member.
         *
         * Further note that we may remove this behaviour. It seems a bit odd
         * to use an edge connection to mark identity in this way and it may
         * be that we need to improve our representation of the domain.
         */
    }

    protected validateComplexInvariants(): InternalError[] {
        return validateEdgeConnection(this);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.members.flatMap(({ compositeIdentifier }) => compositeIdentifier);
    }

    getAvailableCommands(): string[] {
        return [];
    }

    getCompositeIdentifier = () =>
        ({
            type: AggregateType.note,
            id: this.id,
        } as const);
}
