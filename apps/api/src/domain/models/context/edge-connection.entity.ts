import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { EntityId } from '../../types/ResourceId';
import BaseDomainModel from '../BaseDomainModel';
import { noteType } from '../categories/types/ResourceTypeOrNoteType';
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

    /**
     * Tags are optional, in which case this should be an empty array. Also keep
     * in mind that tags are stored by reference (to allow renaming tags without
     * needing cascading updates)
     */
    readonly tagIDs: string[];

    readonly note: string;

    constructor({ id, members, tagIDs, note, type }: DTO<EdgeConnection>) {
        super();

        this.type = type;

        this.id = id;

        // avoid side effects
        this.members = cloneToPlainObject(members);

        this.tagIDs = Array.isArray(tagIDs) && tagIDs.length > 0 ? cloneToPlainObject(tagIDs) : [];

        this.note = note;
    }

    getCompositeIdentifier() {
        return {
            type: noteType,
            id: this.id,
        } as const;
    }
}
