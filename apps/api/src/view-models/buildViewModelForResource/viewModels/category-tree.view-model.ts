import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { Category } from '../../../domain/models/categories/entities/category.entity';
import { CategorizableCompositeIdentifier } from '../../../domain/models/categories/types/ResourceOrNoteCompositeIdentifier';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from './base.view-model';
import buildTreeFromNodes from './utilities/graph/buildTreeFromNodes';

export class CateogryTreeViewModel extends BaseViewModel {
    @FromDomainModel(Category)
    readonly label: string;

    @FromDomainModel(Category)
    readonly members: CategorizableCompositeIdentifier[];

    /**
     * We may need to rename our `FromDomainModel` decorator to
     * `FromRelatedClass` or `FromClass` or `From`.
     */
    /**
     * **WARNING** This property must be defind last!
     *
     * This works because of the order in which decorators are applied. Provided
     * that the `children` property is the last one defined, `NestedDataType`
     * will look up the current schema for `CategoryTreeViewModel` using
     * reflection metadata and find the complete definition.
     */
    @NestedDataType(CateogryTreeViewModel)
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
