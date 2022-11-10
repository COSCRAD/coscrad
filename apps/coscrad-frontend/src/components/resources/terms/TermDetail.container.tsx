import { useLoadableTermById } from '../../../store/slices/resources';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { TermDetailPresenter } from './TermDetail.presenter';

export const TermDetailContainer = (): JSX.Element => {
    const searchResult = useLoadableTermById();

    const Presenter = displayLoadableSearchResult(TermDetailPresenter);

    return <Presenter {...searchResult} />;
};
