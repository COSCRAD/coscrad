import { useLoadableCategoryTree } from '../../store/slices/categories/hooks/use-loadable-category-tree';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { CategoryTreePresenter } from './category-tree.presenter';

export const CategoryTreeContainer: FunctionalComponent = (): JSX.Element => {
    const [loadableCategoryTree] = useLoadableCategoryTree();

    // wrap the presenter with handling for errors and pending state
    const LoadableCategoryPresenter = displayLoadableWithErrorsAndLoading(CategoryTreePresenter);

    return <LoadableCategoryPresenter {...loadableCategoryTree} />;
};
