import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { Box, Typography } from '@mui/material';
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
    <>
        <Typography variant="h3">
            {/* TODO Use standard formatter */}
            Notes for {resourceType}/{id}
        </Typography>
        <Box data-testid="selfNotesPanel">
            {notes.length > 0
                ? notes.map((note) => <SelfNotePresenter {...note} key={note.id} />)
                : 'No Notes Found'}
        </Box>
    </>
);
