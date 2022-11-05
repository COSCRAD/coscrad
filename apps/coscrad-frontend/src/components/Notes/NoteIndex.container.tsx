import { RootState } from '../../store';
import { fetchNotes } from '../../store/slices/notes/thunks';
import { useLoadable } from '../../store/slices/resources/shared/hooks';
import { wrapArrayProps } from '../../utils/prop-manipulation/wrap-array-props';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components/displayLoadableWithErrorsAndLoading';
import { NoteIndexPresenter } from './NoteIndex.presenter';

export const NoteIndexContainer = (): JSX.Element => {
    const selector = (state: RootState) => state.notes;

    const [loadableNotes] = useLoadable({
        selector,
        fetchThunk: fetchNotes,
    });

    // wrap the presenter with handling for errors and pending state
    const LoadableNotePresenter = displayLoadableWithErrorsAndLoading(
        NoteIndexPresenter,
        // wrap the loaded array in a nested prop
        wrapArrayProps
    );

    return <LoadableNotePresenter {...loadableNotes} />;
};
