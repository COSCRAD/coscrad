import {
    CategorizableType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
    IDetailQueryResult,
    IIndexQueryResult,
    WithTags,
} from '@coscrad/api-interfaces';
import { SimulatedKeyboardConfig } from '../../configurable-front-matter/data/configurable-content-schema';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { CommandPanel } from '../commands';
import { buildCommandExecutor, buildDynamicCommandForm } from '../commands/command-executor';
import { buildUseLoadableForSingleCategorizableType } from './buildUseLoadableResourcesOfSingleType';
import { displayLoadableWithErrorsAndLoading } from './display-loadable-with-errors-and-loading';

export interface FilteredAggregateIndexContainerProps<
    T extends WithTags<IBaseViewModel>,
    UPresenterProps = IDetailQueryResult<T>
> {
    IndexPresenter: FunctionalComponent<UPresenterProps>;
    preFilter?: (model: T) => boolean;
    aggregateType: CategorizableType;
    simulatedKeyboard: SimulatedKeyboardConfig;
}

export const FilteredCategorizableIndexContainer = <
    T extends ICategorizableDetailQueryResult<WithTags<IBaseViewModel>>,
    U = T
>({
    IndexPresenter,
    preFilter,
    aggregateType,
}: FilteredAggregateIndexContainerProps<T, U>): JSX.Element => {
    const loadableModels = buildUseLoadableForSingleCategorizableType(
        aggregateType
    )() as unknown as ILoadable<IIndexQueryResult<T>>;

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
            {/* TODO Use loadable display helper */}
            {loadableModels.data?.indexScopedActions?.length > 0 && (
                <CommandPanel
                    actions={loadableModels.data.indexScopedActions.map((action) => ({
                        ...action,
                        executor: buildCommandExecutor(
                            buildDynamicCommandForm(action),
                            /**
                             * Naturally bound index-scoped commands do not require
                             * any payload properties to be bound aside from the
                             * `aggregateCompositeIdentifer` that must be bulit from
                             * the newly generated ID.
                             */
                            {},
                            aggregateType
                        ),
                    }))}
                />
            )}
        </div>
    );
};
