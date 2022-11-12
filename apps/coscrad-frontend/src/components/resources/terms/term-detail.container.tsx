import { useLoadableTermById } from '../../../store/slices/resources';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { TermDetailPresenter } from './term-detail.presenter';

export const TermDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadableTermById}
        DetailPresenter={TermDetailPresenter}
    />
);
