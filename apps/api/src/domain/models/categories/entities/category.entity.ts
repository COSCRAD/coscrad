import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { EntityId } from '../../types/EntityId';
import { ResourceOrNoteCompositeIdentifier } from '../types/ResourceOrNoteCompositeIdentifier';

export class Category extends BaseDomainModel {
    id: EntityId;

    label: string;

    members: ResourceOrNoteCompositeIdentifier[];

    constructor({ id, label, members }: DTO<Category>) {
        super();

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);
    }
}
