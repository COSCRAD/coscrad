import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { displayLoadableWithErrorsAndLoading } from './display-loadable-with-errors-and-loading';

export interface FilteredAggregateIndexContainerProps<
    T extends IBaseViewModel,
    UPresenterProps = T
> {
    useLoadableModels: () => ILoadable<IIndexQueryResult<T>>;
    IndexPresenter: FunctionalComponent<UPresenterProps>;
    filter?: (model: T) => boolean;
}

export const FilteredAggregateIndexContainer = <T extends IBaseViewModel, U = T>({
    useLoadableModels,
    IndexPresenter,
    filter,
}: FilteredAggregateIndexContainerProps<T, U>): JSX.Element => {
    const loadableModels = useLoadableModels();

    const filteredLoadableModels =
        typeof filter === 'function' && loadableModels.data !== null
            ? {
                  ...loadableModels,
                  data: {
                      data: loadableModels.data.data.filter(({ data: model }) => filter(model)),
                  },
              }
            : loadableModels;

    // Wrap in error and pending presentation
    const Presenter = displayLoadableWithErrorsAndLoading(IndexPresenter);

    return <Presenter {...filteredLoadableModels} />;
};
