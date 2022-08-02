import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import validateEdgeConnection from '../../domainModelValidators/contextValidators/validateEdgeConnection';
import { isValid, Valid } from '../../domainModelValidators/Valid';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';
import { ResourceCompositeIdentifier } from '../../types/ResourceCompositeIdentifier';
import { InMemorySnapshot } from '../../types/ResourceType';
import { Aggregate } from '../aggregate.entity';
import { Resource } from '../resource.entity';
import AggregateIdAlraedyInUseError from '../shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import idEquals from '../shared/functional/idEquals';
import { ContextModelUnion } from './types/ContextModelUnion';

export enum EdgeConnectionType {
    self = 'self',
    dual = 'dual',
}

export const isEdgeConnectionType = (input: unknown): input is EdgeConnectionType =>
    Object.values(EdgeConnectionType).includes(input as EdgeConnectionType);

export enum EdgeConnectionMemberRole {
    to = 'to',
    from = 'from',
    self = 'self',
}

// Consider using a class for this
export type EdgeConnectionMember<TContextModel extends ContextModelUnion = ContextModelUnion> = {
    compositeIdentifier: ResourceCompositeIdentifier;
    context: TContextModel;
    role: EdgeConnectionMemberRole;
};

@RegisterIndexScopedCommands([])
export class EdgeConnection extends Aggregate {
    type = AggregateType.note;

    connectionType: EdgeConnectionType;

    id: AggregateId;

    readonly members: EdgeConnectionMember[];

    readonly note: string;

    constructor(dto: DTO<EdgeConnection>) {
        super(dto);

        const { id, members, note, connectionType: type } = dto;
        this.connectionType = type;

        this.id = id;

        // avoid side effects
        this.members = cloneToPlainObject(members);

        this.note = note;
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
        const { connections } = externalState;

        const allErrors: InternalError[] = [];

        if (connections.some(idEquals(this.id)))
            allErrors.push(new AggregateIdAlraedyInUseError(this.getCompositeIdentifier()));

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
         */
    }

    validateInvariants(): ResultOrError<Valid> {
        return validateEdgeConnection(this);
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
