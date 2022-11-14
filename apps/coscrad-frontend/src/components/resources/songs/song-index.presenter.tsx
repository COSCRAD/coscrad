import { SongIndexState } from '../../../store/slices/resources/songs/types';
import { GenericIndexPresenter } from '../../../utils/generic-components/presenters/generic-index-presenter';

export const SongIndexPresenter = (songIndexResult: SongIndexState) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    return <GenericIndexPresenter {...songIndexResult} indexLabel={'Songs'} />;
};
