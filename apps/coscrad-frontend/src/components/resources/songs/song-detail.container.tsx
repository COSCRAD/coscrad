import { useLoadableSongById } from '../../../store/slices/resources';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { SongDetailPresenter } from './song-detail.presenter';

export const SongDetailContainer = (): JSX.Element => {
    const loadableSong = useLoadableSongById();

    // Huge gotcha- if we accidentally use `displayLoadableWithErrorsAndLoading` here!
    const Presenter = displayLoadableSearchResult(SongDetailPresenter);

    return <Presenter {...loadableSong} />;
};
