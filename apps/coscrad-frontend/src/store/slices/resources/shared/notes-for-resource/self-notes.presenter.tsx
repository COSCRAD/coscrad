import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { SelfConnectionNote } from '../../../notes/hooks/use-loadable-self-notes-for-resource';
import { SelfNotePresenter } from './self-note.presenter';

interface SelfNotesProps {
    compositeIdentifier: ResourceCompositeIdentifier;
    notes: SelfConnectionNote[];
}

export const SelfNotesPresenter = ({ notes }: SelfNotesProps): JSX.Element => (
    // TODO remove magic string
    <>
        <div data-testid="selfNotes" />
        {notes.length > 0
            ? notes.map((note) => <SelfNotePresenter {...note} key={note.id} />)
            : 'No Notes Found'}
    </>
);
