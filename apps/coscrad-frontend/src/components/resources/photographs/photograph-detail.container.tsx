import { useLoadablePhotographById } from '../../../store/slices/resources/photographs/hooks';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { PhotographDetailPresenter } from './photograph-detail.presenter';

export const PhotographDetailContainer = (): JSX.Element => {
    const loadablePhotographSearchResult = useLoadablePhotographById();

    const Presenter = displayLoadableSearchResult(PhotographDetailPresenter);

    return <Presenter {...loadablePhotographSearchResult} />;
};
