import { Category } from '../../../domain/models/categories/entities/category.entity';
import { CategorizableCompositeIdentifier } from '../../../domain/models/categories/types/ResourceOrNoteCompositeIdentifier';
import { AggregateId } from '../../../domain/types/AggregateId';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from './base.view-model';
import buildTreeFromNodes from './utilities/graph/buildTreeFromNodes';

export class CateogryTreeViewModel extends BaseViewModel {
    // The ID of the root category, '0' for the entire category tree
    readonly id: AggregateId;

    readonly label: string;

    readonly members: CategorizableCompositeIdentifier[];

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
