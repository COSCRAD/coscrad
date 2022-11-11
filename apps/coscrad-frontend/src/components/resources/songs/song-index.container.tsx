import { useLoadableSongs } from '../../../store/slices/resources';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { SongIndexPresenter } from './song-index.presenter';

export const SongIndexContainer = (): JSX.Element => {
    const loadableSongs = useLoadableSongs();

    const Presenter = displayLoadableWithErrorsAndLoading(SongIndexPresenter);

    return <Presenter {...loadableSongs} />;
};
