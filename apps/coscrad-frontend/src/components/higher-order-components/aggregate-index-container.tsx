import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { displayLoadableWithErrorsAndLoading } from './displayLoadableWithErrorsAndLoading';

export interface AggregateIndexContainerProps<T, UPresenterProps = T> {
    useLoadableModels: () => ILoadable<T>;
    IndexPresenter: FunctionalComponent<UPresenterProps>;
}

export const AggregateIndexContainer = <T, U = T>({
    useLoadableModels,
    IndexPresenter,
}: AggregateIndexContainerProps<T, U>): JSX.Element => {
    const loadableModels = useLoadableModels();

    const Presenter = displayLoadableWithErrorsAndLoading(IndexPresenter);

    return <Presenter {...loadableModels} />;
};
