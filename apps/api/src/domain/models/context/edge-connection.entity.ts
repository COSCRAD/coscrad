import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { CategorizableType } from '../../types/CategorizableType';
import { EntityId } from '../../types/ResourceId';
import BaseDomainModel from '../BaseDomainModel';
import { HasEntityID } from '../types/HasEntityId';
import { ResourceCompositeIdentifier } from '../types/ResourceCompositeIdentifier';
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

export class EdgeConnection extends BaseDomainModel implements HasEntityID {
    type: EdgeConnectionType;

    id: EntityId;

    readonly members: EdgeConnectionMember[];

    readonly note: string;

    constructor({ id, members, note, type }: DTO<EdgeConnection>) {
        super();

        this.type = type;

        this.id = id;

        // avoid side effects
        this.members = cloneToPlainObject(members);

        this.note = note;
    }

    getCompositeIdentifier() {
        return {
            type: CategorizableType.note,
            id: this.id,
        } as const;
    }
}
