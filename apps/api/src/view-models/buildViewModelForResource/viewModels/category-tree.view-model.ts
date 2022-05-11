import { Category } from '../../../domain/models/categories/entities/category.entity';
import { ResourceOrNoteCompositeIdentifier } from '../../../domain/models/categories/types/ResourceOrNoteCompositeIdentifier';
import { EntityId } from '../../../domain/types/ResourceId';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from './base.view-model';
import buildTreeFromNodes from './utilities/graph/buildTreeFromNodes';

export class CateogryTreeViewModel extends BaseViewModel {
    // The ID of the root category, '0' for the entire category tree
    readonly id: EntityId;

    readonly label: string;

    readonly members: ResourceOrNoteCompositeIdentifier[];

    readonly children: CateogryTreeViewModel[];

    constructor(categoryTree: Category[]) {
        const tree = buildTreeFromNodes(categoryTree);

        super({ id: tree.id });

        const { label, members, children } = tree;

        this.label = label;

        this.members = cloneToPlainObject(members);

        this.children = cloneToPlainObject(children);
    }
}
