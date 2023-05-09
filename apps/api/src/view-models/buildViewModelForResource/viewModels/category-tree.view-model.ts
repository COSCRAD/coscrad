import { ICategoryTreeViewModel, ICompositeIdentifier } from '@coscrad/api-interfaces';
import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { buildMultilingualTextWithSingleItem } from '../../../domain/common/build-multilingual-text-with-single-item';
import { Category } from '../../../domain/models/categories/entities/category.entity';
import { CategorizableType } from '../../../domain/types/CategorizableType';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseViewModel } from './base.view-model';

import buildTreeFromNodes from './utilities/graph/buildTreeFromNodes';

const FromCategory = FromDomainModel(Category);

export class CategoryTreeViewModel
    extends BaseViewModel
    implements ICategoryTreeViewModel<CategorizableType>
{
    @FromCategory
    readonly label: string;

    @FromCategory
    readonly members: ICompositeIdentifier<CategorizableType>[];

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
    @NestedDataType(CategoryTreeViewModel, {
        label: 'children',
        description:
            'self similar reference to all categories that are direct-descendants of this category in the tree',
    })
    // Note the use of the concrete type here
    readonly children: CategoryTreeViewModel[];

    constructor(categoryTree: Category[]) {
        const tree = buildTreeFromNodes(categoryTree);

        // TODO remove hack
        super({ id: tree.id, getName: () => buildMultilingualTextWithSingleItem(tree.label) });

        const { label, members, children } = tree;

        this.label = label;

        this.members = cloneToPlainObject(members);

        this.children = cloneToPlainObject(children);
    }
}
