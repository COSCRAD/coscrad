import {
    AggregateType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { CommandPanel } from '../commands';
import { displayLoadableWithErrorsAndLoading } from './display-loadable-with-errors-and-loading';

export interface FilteredAggregateIndexContainerProps<
    T extends ICategorizableDetailQueryResult<IBaseViewModel>,
    UPresenterProps = T
> {
    // TODO build this from the aggregateType
    useLoadableModels: () => ILoadable<IIndexQueryResult<T>>;
    IndexPresenter: FunctionalComponent<UPresenterProps>;
    preFilter?: (model: T) => boolean;
    aggregateType: AggregateType;
}

export const FilteredCategorizableIndexContainer = <
    T extends ICategorizableDetailQueryResult<IBaseViewModel>,
    U = T
>({
    useLoadableModels,
    IndexPresenter,
    preFilter,
    aggregateType,
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

    // Wrap in error and pending presentation
    const Presenter = displayLoadableWithErrorsAndLoading(IndexPresenter);

    return (
        <div>
            <Presenter {...filteredLoadableModels} />
            {loadableModels.data?.indexScopedActions && (
                <CommandPanel
                    actions={loadableModels.data.indexScopedActions}
                    commandContext={aggregateType}
                />
            )}
        </div>
    );
};
