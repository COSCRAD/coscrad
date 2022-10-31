import { useParams } from 'react-router-dom';
import { RootState } from '../../../store';
import { fetchTerms } from '../../../store/slices/resources';
import { useLoadable } from '../../../utils/custom-hooks/useLoadable';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { NotFound } from '../../NotFound';
import { TermDetailPresenter } from './TermDetail.presenter';

export const TermDetailContainer = (): JSX.Element => {
    const { id: idFromLocation } = useParams();

    const [loadableTerms] = useLoadable({
        selector: (state: RootState) => state.terms,
        fetchThunk: fetchTerms,
    });

    const Presenter = displayLoadableWithErrorsAndLoading(TermDetailPresenter);

    const { data: allTerms, isLoading, errorInfo } = loadableTerms;

    if (isLoading || errorInfo || allTerms === null) return <Presenter {...loadableTerms} />;

    // We need some serious renaming of properties here!
    const searchResult = allTerms.data
        .map(({ data }) => data)
        .find(({ id }) => id === idFromLocation);

    if (!searchResult) return <NotFound></NotFound>;

    return <TermDetailPresenter {...searchResult} />;
};
