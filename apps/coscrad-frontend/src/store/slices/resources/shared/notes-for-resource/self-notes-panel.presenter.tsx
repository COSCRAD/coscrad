import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { Box, Button, Drawer } from '@mui/material';
import { useState } from 'react';
import { SelfConnectionNote } from '../../../notes/hooks/use-loadable-self-notes-for-resource';
import { SelfNotePresenter } from './self-note.presenter';

interface SelfNotesPanelProps {
    compositeIdentifier: ResourceCompositeIdentifier;
    notes: SelfConnectionNote[];
}

export const SelfNotesPanelPresenter = ({
    compositeIdentifier: { type: resourceType, id },
    notes,
}: SelfNotesPanelProps): JSX.Element => {
    /**
     * Temporary logic for drawer
     */

    const [selfNotesPanelState, setSelfNotesPanelState] = useState(false);

    const handleDrawerToggle = () => {
        setSelfNotesPanelState(!selfNotesPanelState);
    };

    const drawerWidth = '600px';

    return (
        // TODO remove magic string
        <>
            <Box sx={{ mt: 2.5 }}>
                <Button variant="contained" onClick={handleDrawerToggle}>
                    Notes
                </Button>
            </Box>

            <Drawer
                variant="temporary"
                anchor="right"
                open={selfNotesPanelState}
                onClose={handleDrawerToggle}
                sx={{
                    width: drawerWidth,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                }}
            >
                <div data-testid={'selfNotesPanel'}>
                    <Box sx={{ padding: 2 }}>
                        <h2>
                            {/* TODO Use standard formatter */}
                            Notes for {resourceType}/{id}
                        </h2>
                        <div>
                            {notes.length > 0
                                ? notes.map((note) => <SelfNotePresenter {...note} key={note.id} />)
                                : 'No Notes Found'}
                        </div>
                    </Box>
                </div>
            </Drawer>
        </>
    );
};
