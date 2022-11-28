import { useLoadableCategoryTree } from '../../store/slices/categories/hooks/use-loadable-category-tree';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { AggregateIndexContainer } from '../higher-order-components/aggregate-index-container';
import { CategoryTreePresenter } from './category-tree.presenter';

export const CategoryTreeContainer: FunctionalComponent = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableCategoryTree}
        IndexPresenter={CategoryTreePresenter}
    />
);