import { useLoadablePhotographById } from '../../../store/slices/resources/photographs/hooks';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { PhotographDetailPresenter } from './photograph-detail.presenter';

export const PhotographDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadablePhotographById}
        DetailPresenter={PhotographDetailPresenter}
    />
);
