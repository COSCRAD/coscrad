import { useLoadableSongById } from '../../../store/slices/resources';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { SongDetailPresenter } from './song-detail.presenter';

export const SongDetailContainer = (): JSX.Element => {
    const loadableSong = useLoadableSongById();

    const Presenter = displayLoadableWithErrorsAndLoading(SongDetailPresenter);

    return <Presenter {...loadableSong} />;
};
