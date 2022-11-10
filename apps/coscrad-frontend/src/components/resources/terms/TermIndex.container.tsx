import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { useLoadableTerms } from '../../../store/slices/resources';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { TermIndexPresenter } from './TermIndex.presenter';

export const TermIndexContainer = (): JSX.Element => {
    const [loadableTerms] = useLoadableTerms();

    const LoadableTermPresenter = displayLoadableWithErrorsAndLoading<
        IIndexQueryResult<ITermViewModel>,
        IIndexQueryResult<ITermViewModel>
    >(TermIndexPresenter);

    return <LoadableTermPresenter {...loadableTerms} />;
};
