import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { CommandPanel, INDEX_COMMAND_CONTEXT } from '../commands';
import { displayLoadableWithErrorsAndLoading } from './display-loadable-with-errors-and-loading';

export interface AggregateIndexContainerProps<T, UPresenterProps = T> {
    useLoadableModels: () => ILoadable<T>;
    IndexPresenter: FunctionalComponent<UPresenterProps>;
}

export const AggregateIndexContainer = <T, U = T>({
    useLoadableModels,
    IndexPresenter,
}: AggregateIndexContainerProps<T, U>): JSX.Element => {
    const loadableModels = useLoadableModels();

    // Wrap in error and pending presentation
    const Presenter = displayLoadableWithErrorsAndLoading(IndexPresenter);

    return (
        <div>
            <Presenter {...loadableModels} />
            {/* TODO [https://www.pivotaltracker.com/story/show/183456862] */}
            {/* @ts-expect-error fix index response types */}
            {loadableModels.data?.actions && (
                <CommandPanel
                    // @ts-expect-error fix index response types
                    actions={loadableModels.data.actions}
                    commandContext={INDEX_COMMAND_CONTEXT}
                />
            )}
        </div>
    );
};
