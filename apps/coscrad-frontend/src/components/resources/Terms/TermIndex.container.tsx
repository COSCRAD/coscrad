import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { RootState } from '../../../store';
import { fetchTerms } from '../../../store/slices/resources';
import { useLoadable } from '../../../utils/custom-hooks/useLoadable';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { TermIndexPresenter } from './TermIndex.presenter';

export const TermIndexContainer = (): JSX.Element => {
    const [loadableTerms] = useLoadable({
        selector: (state: RootState) => state.terms,
        fetchThunk: fetchTerms,
    });

    const LoadableTermPresenter = displayLoadableWithErrorsAndLoading<
        IIndexQueryResult<ITermViewModel>,
        IIndexQueryResult<ITermViewModel>
    >(TermIndexPresenter);

    return <LoadableTermPresenter {...loadableTerms} />;
};
