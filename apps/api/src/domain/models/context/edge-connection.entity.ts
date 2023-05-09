import { CompositeIdentifier, CoscradEnum, Enum, NonEmptyString, Union } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import validateEdgeConnection from '../../domainModelValidators/contextValidators/validateEdgeConnection';
import { isValid, Valid } from '../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../types/AggregateType';
import { ResourceCompositeIdentifier } from '../../types/ResourceCompositeIdentifier';
import { InMemorySnapshot, isResourceType, ResourceType } from '../../types/ResourceType';
import { Aggregate } from '../aggregate.entity';
import BaseDomainModel from '../BaseDomainModel';
import { Resource } from '../resource.entity';
import AggregateIdAlreadyInUseError from '../shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import idEquals from '../shared/functional/idEquals';
import { EdgeConnectionContext } from './context.entity';
import { FreeMultilineContext } from './free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from './general-context/general-context.entity';
import { IdentityContext } from './identity-context.entity/identity-context.entity';
import { PageRangeContext } from './page-range-context/page-range.context.entity';
import { PointContext } from './point-context/point-context.entity';
import { TextFieldContext } from './text-field-context/text-field-context.entity';
import { TimeRangeContext } from './time-range-context/time-range-context.entity';

export { isEdgeConnectionType } from '@coscrad/api-interfaces';
export { EdgeConnectionMemberRole, EdgeConnectionType, IEdgeConnectionMember };

import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IEdgeConnectionMember,
} from '@coscrad/api-interfaces';
import formatAggregateCompositeIdentifier from '../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';

export class EdgeConnectionMember<T extends EdgeConnectionContext = EdgeConnectionContext>
    extends BaseDomainModel
    implements IEdgeConnectionMember
{
    @CompositeIdentifier(ResourceType, isResourceType, {
        label: 'composite identifier',
        description: "composite identifier of the members's resource",
    })
    readonly compositeIdentifier: ResourceCompositeIdentifier;

    @Union(
        [
            FreeMultilineContext,
            GeneralContext,
            IdentityContext,
            PageRangeContext,
            PointContext,
            TextFieldContext,
            TimeRangeContext,
        ],
        'type',
        {
            label: 'context',
            description: 'contextualizes this resource as a member of this connection',
        }
    )
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

@RegisterIndexScopedCommands([])
export class EdgeConnection extends Aggregate {
    type = AggregateType.note;

    connectionType: EdgeConnectionType;

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
                resource: (resources[type] as Resource[]).find((resource) => resource.id === id),
                context,
            }))
            .map(({ resource, context }) => resource.validateContext(context))
            .filter((result): result is InternalError => !isValid(result));
    }

    validateExternalState(externalState: InMemorySnapshot): ValidationResult {
        const { note: connections } = externalState;

        const allErrors: InternalError[] = [];

        if (connections.some(idEquals(this.id)))
            allErrors.push(new AggregateIdAlreadyInUseError(this.getCompositeIdentifier()));

        allErrors.push(...this.validateMembersState(externalState));

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
