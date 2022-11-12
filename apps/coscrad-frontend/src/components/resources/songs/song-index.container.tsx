import { useLoadableSongs } from '../../../store/slices/resources';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { SongIndexPresenter } from './song-index.presenter';

export const SongIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableSongs}
        IndexPresenter={SongIndexPresenter}
    />
);
