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

    // Double check typesafety in places like this
    const LoadableTermPresenter = displayLoadableWithErrorsAndLoading(TermIndexPresenter);

    return <LoadableTermPresenter {...loadableTerms} />;
};
