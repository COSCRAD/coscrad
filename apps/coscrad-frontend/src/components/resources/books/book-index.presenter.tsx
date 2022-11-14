import { BookIndexState } from '../../../store/slices/resources/books/types';
import { GenericIndexPresenter } from '../../../utils/generic-components/presenters/generic-index-presenter';

export const BookIndexPresenter = (bookIndexResult: BookIndexState) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    return <GenericIndexPresenter {...bookIndexResult} indexLabel={'Books'} />;
};
