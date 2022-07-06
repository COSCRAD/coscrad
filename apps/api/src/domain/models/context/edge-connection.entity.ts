import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import validateEdgeConnection from '../../domainModelValidators/contextValidators/validateEdgeConnection';
import { Valid } from '../../domainModelValidators/Valid';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';
import { ResourceCompositeIdentifier } from '../../types/ResourceCompositeIdentifier';
import { Aggregate } from '../aggregate.entity';
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
