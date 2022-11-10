import { useLoadableNotes } from '../../store/slices/notes/hooks';
import { wrapArrayProps } from '../../utils/prop-manipulation/wrap-array-props';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components/displayLoadableWithErrorsAndLoading';
import { NoteIndexPresenter } from './NoteIndex.presenter';

export const NoteIndexContainer = (): JSX.Element => {
    const [loadableNotes] = useLoadableNotes();

    // wrap the presenter with handling for errors and pending state
    const LoadableNotePresenter = displayLoadableWithErrorsAndLoading(
        NoteIndexPresenter,
        // wrap the loaded array in a nested prop
        wrapArrayProps
    );

    return <LoadableNotePresenter {...loadableNotes} />;
};
