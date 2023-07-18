import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { SelfConnectionNote } from '../../../notes/hooks/use-loadable-self-notes-for-resource';
import { SelfNotePresenter } from './self-note.presenter';

interface SelfNotesPanelProps {
    compositeIdentifier: ResourceCompositeIdentifier;
    notes: SelfConnectionNote[];
}

export const SelfNotesPanelPresenter = ({ notes }: SelfNotesPanelProps): JSX.Element => (
    // TODO remove magic string
    <>
        <div data-testid="selfNotesPanel" />
        {notes.length > 0
            ? notes.map((note) => <SelfNotePresenter {...note} key={note.id} />)
            : 'No Notes Found'}
    </>
);
