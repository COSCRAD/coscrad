import { useLoadablePhotographs } from '../../../store/slices/resources/photographs/hooks';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { PhotographIndexPresenter } from './photograph-index.presenter';

export const PhotographIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadablePhotographs}
        IndexPresenter={PhotographIndexPresenter}
    />
);
