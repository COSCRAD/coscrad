import { useLoadableTerms } from '../../../store/slices/resources';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { TermIndexPresenter } from './term-index.presenter';

export const TermIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableTerms}
        IndexPresenter={TermIndexPresenter}
    />
);
