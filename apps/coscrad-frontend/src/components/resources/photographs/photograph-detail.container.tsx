import { selectLoadablePhotographs } from '../../../store/slices/resources/photographs';
import { fetchPhotographs } from '../../../store/slices/resources/photographs/thunks';
import { useIdFromLocation } from '../../../utils/custom-hooks/use-id-from-location';
import { useLoadable } from '../../../utils/custom-hooks/useLoadable';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { NotFound } from '../../NotFound';
import { PhotographDetailPresenter } from './photograph-detail.presenter';

export const PhotographDetailContainer = (): JSX.Element => {
    const [idFromLocation] = useIdFromLocation();

    const [loadableTerms] = useLoadable({
        selector: selectLoadablePhotographs,
        fetchThunk: fetchPhotographs,
    });

    const Presenter = displayLoadableWithErrorsAndLoading(PhotographDetailPresenter);

    const { data: allTerms, isLoading, errorInfo } = loadableTerms;

    if (isLoading || errorInfo || allTerms === null) return <Presenter {...loadableTerms} />;

    // We need some serious renaming of properties here!
    const searchResult = allTerms.data.find(({ data: { id } }) => id === idFromLocation);

    if (!searchResult) return <NotFound></NotFound>;

    return <PhotographDetailPresenter {...searchResult} />;
};
