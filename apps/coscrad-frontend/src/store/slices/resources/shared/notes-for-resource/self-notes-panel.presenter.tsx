import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { SelfConnectionNote } from '../../../notes/hooks/use-loadable-self-notes-for-resource';
import { SelfNotePresenter } from './self-note.presenter';

interface SelfNotesPanelProps {
    compositeIdentifier: ResourceCompositeIdentifier;
    notes: SelfConnectionNote[];
}

export const SelfNotesPanelPresenter = ({
    compositeIdentifier: { type: resourceType, id },
    notes,
}: SelfNotesPanelProps): JSX.Element => (
    // TODO remove magic string
    <div data-testid={'selfNotesPanel'}>
        <h2>
            {/* TODO Use standard formatter */}
            Notes for {resourceType}/{id}
        </h2>
        <div>
            {notes.map((note) => (
                <SelfNotePresenter {...note} key={note.id} />
            ))}
        </div>
    </div>
);
