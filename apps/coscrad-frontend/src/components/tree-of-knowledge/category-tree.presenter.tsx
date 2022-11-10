import { ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../utils/types/functional-component';

/**
 * Note that this same presenter can also be used to present a sub-tree, thanks
 * to self-similarity.
 */
export const CategoryTreePresenter: FunctionalComponent<ICategoryTreeViewModel> = (
    tree: ICategoryTreeViewModel
) => (
    <div data-testid="categoryTree">
        <h2>Tree of Knowledge</h2>
        {JSON.stringify(tree)}
    </div>
);
