import { useLoadableSongById } from '../../../store/slices/resources';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { SongDetailPresenter } from './song-detail.presenter';

export const SongDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadableSongById}
        DetailPresenter={SongDetailPresenter}
    />
);
