import { AggregateType } from '@coscrad/api-interfaces';
import { useLoadableNotes } from '../../store/slices/notes/hooks';
import { NoteIndexState } from '../../store/slices/notes/types/note-index-state';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components/display-loadable-with-errors-and-loading';
import { WithCommands } from '../resources/shared';
import { NoteIndexPresenter } from './note-index.presenter';

export const NoteIndexContainer = (): JSX.Element => {
    const loadableNotes = useLoadableNotes();

    const IndexPresenter = WithCommands(
        NoteIndexPresenter,
        ({ indexScopedActions }: NoteIndexState) => indexScopedActions,
        (_) => AggregateType.note
    );

    // wrap the presenter with handling for errors and pending state
    const LoadableNotePresenter = displayLoadableWithErrorsAndLoading(IndexPresenter);

    return <LoadableNotePresenter {...loadableNotes} />;
};
