import { useLoadablePhotographs } from '../../../store/slices/resources/photographs/hooks/use-loadable-photographs';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { PhotographIndexPresenter } from './photograph-index.presenter';

export const PhotographIndexContainer = (): JSX.Element => {
    // Consider exporting a custom `usePhotographs` hook from the slice
    const [loadablePhotographs] = useLoadablePhotographs();

    const Presenter = displayLoadableWithErrorsAndLoading(PhotographIndexPresenter);

    return <Presenter {...loadablePhotographs} />;
};
