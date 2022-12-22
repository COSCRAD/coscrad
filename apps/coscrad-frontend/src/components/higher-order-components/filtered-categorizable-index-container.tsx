import {
    IBaseViewModel,
    ICategorizableDetailQueryResult,
    ICategorizableIndexQueryResult,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { INDEX_COMMAND_CONTEXT } from '../commands';
import { WithCommands } from '../resources/shared';
import { displayLoadableWithErrorsAndLoading } from './display-loadable-with-errors-and-loading';

export interface FilteredAggregateIndexContainerProps<
    T extends ICategorizableDetailQueryResult<IBaseViewModel>,
    UPresenterProps = T
> {
    useLoadableModels: () => ILoadable<IIndexQueryResult<T>>;
    IndexPresenter: FunctionalComponent<UPresenterProps>;
    preFilter?: (model: T) => boolean;
}

export const FilteredCategorizableIndexContainer = <
    T extends ICategorizableDetailQueryResult<IBaseViewModel>,
    U = T
>({
    useLoadableModels,
    IndexPresenter,
    preFilter,
}: FilteredAggregateIndexContainerProps<T, U>): JSX.Element => {
    const loadableModels = useLoadableModels();

    const filteredLoadableModels =
        typeof preFilter === 'function' && loadableModels.data !== null
            ? {
                  ...loadableModels,
                  data: {
                      entities: loadableModels.data.entities.filter((model) => preFilter(model)),
                  },
              }
            : loadableModels;

    const IndexPresenterWithCommands = WithCommands(
        IndexPresenter,
        // @ts-expect-error fix me
        ({ indexScopedActions }: ICategorizableIndexQueryResult<IBaseViewModel>) =>
            indexScopedActions,
        (_) => INDEX_COMMAND_CONTEXT
    );

    // Wrap in error and pending presentation
    const Presenter = displayLoadableWithErrorsAndLoading(IndexPresenterWithCommands);

    return <Presenter {...filteredLoadableModels} />;
};
