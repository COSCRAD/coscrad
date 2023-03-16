import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { CoscradMainContentContainer } from '../../../../../utils/generic-components/style-components/coscrad-main-content-container';
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
    <CoscradMainContentContainer>
        <div style={{ height: 0 }} data-testid={'selfNotesPanel'}>
            &nbsp;
        </div>
        <Typography variant="h3">
            {/* TODO Use standard formatter */}
            Notes for {resourceType}/{id}
        </Typography>
        <div>
            {notes.length > 0
                ? notes.map((note) => <SelfNotePresenter {...note} key={note.id} />)
                : 'No Notes Found'}
        </div>
    </CoscradMainContentContainer>
);
