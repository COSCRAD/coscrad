import { AggregateType, IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { CommandPanel } from '../commands';
import {
    buildCommandExecutor,
    buildDynamicCommandForm,
} from '../commands/dynamic-command-execution-form';
import { displayLoadableWithErrorsAndLoading } from './display-loadable-with-errors-and-loading';

export interface AggregateIndexContainerProps<
    T extends IIndexQueryResult<IBaseViewModel>,
    UPresenterProps = T
> {
    // TODO Consider building this from the aggregate type
    useLoadableModels: () => ILoadable<T>;
    IndexPresenter: FunctionalComponent<UPresenterProps>;
    aggregateType: AggregateType;
}

export const AggregateIndexContainer = <T extends IIndexQueryResult<IBaseViewModel>, U = T>({
    useLoadableModels,
    IndexPresenter,
    aggregateType,
}: AggregateIndexContainerProps<T, U>): JSX.Element => {
    const loadableModels = useLoadableModels();

    // Wrap in error and pending presentation
    const Presenter = displayLoadableWithErrorsAndLoading<T, unknown>(IndexPresenter);

    return (
        <div>
            <Presenter {...loadableModels} />
            {/* TODO [https://www.pivotaltracker.com/story/show/183456862] */}
            {loadableModels.data?.indexScopedActions?.length > 0 && (
                <CommandPanel
                    actions={loadableModels.data.indexScopedActions.map((action) => ({
                        ...action,
                        form: buildCommandExecutor(buildDynamicCommandForm(action)),
                    }))}
                    commandContext={aggregateType}
                />
            )}
        </div>
    );
};
