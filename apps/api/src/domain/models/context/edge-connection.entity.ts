import cloneToPlainObject from 'apps/api/src/lib/utilities/cloneToPlainObject';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { EntityId } from '../../types/ResourceId';
import BaseDomainModel from '../BaseDomainModel';
import { ResourceCompositeIdentifier } from '../types/entityCompositeIdentifier';
import { ContextModelUnion } from './types/ContextModelUnion';

export enum EdgeConnectionType {
    self = 'self',
    // TODO Is there a better name for this?
    dual = 'dual',
}

export enum EdgeConnectionMemberRole {
    to = 'to',
    from = 'from',
    self = 'self',
}

// Consider using a class for this
type EdgeConnectionMember<TContextModel extends ContextModelUnion = ContextModelUnion> = {
    compositeIdentifier: ResourceCompositeIdentifier;
    context: TContextModel;
    role: EdgeConnectionMemberRole;
};

export class EdgeConnection extends BaseDomainModel {
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

    constructor({ id, members, tagIDs, note }: PartialDTO<EdgeConnection>) {
        super();

        this.id = id;

        // avoid side effects
        this.members = cloneToPlainObject(members);

        this.tagIDs = Array.isArray(tagIDs) && tagIDs.length > 0 ? cloneToPlainObject(tagIDs) : [];

        this.note = note;
    }
}
