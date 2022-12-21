import { useLoadableNotes } from '../../store/slices/notes/hooks';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components/display-loadable-with-errors-and-loading';
import { NoteIndexPresenter } from './note-index.presenter';

export const NoteIndexContainer = (): JSX.Element => {
    const loadableNotes = useLoadableNotes();

    // wrap the presenter with handling for errors and pending state
    const LoadableNotePresenter = displayLoadableWithErrorsAndLoading(NoteIndexPresenter);

    return <LoadableNotePresenter {...loadableNotes} />;
};
