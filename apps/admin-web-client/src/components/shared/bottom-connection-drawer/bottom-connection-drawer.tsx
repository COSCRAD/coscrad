import { ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Divider,
    Drawer,
    Grid,
    IconButton,
    styled,
    Tooltip,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { thumbnailCategorizableDetailPresenterFactory } from '../../resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { BlinkingStatusDot } from '../blinking-badge/blinking-status-dot';
import { toggleBottomConnectionDrawer } from '../store/connection.slice';
import { CreateConnectionWithNoteForm } from './create-connection-with-note-form';

const DrawerHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    margin: theme.spacing(2, 4, 0, 4),
    justifyContent: 'space-between',
}));

export const BottomConnectionDrawer = (): JSX.Element => {
    const dispatch = useDispatch();

    const [isBottomDrawerExpanded, setIsBottomDrawerExpanded] = useState(false);

    const {
        open,
        connectionMembers: { from, to },
    } = useSelector((state: RootState) => state.connectionSlice);

    const handleMakeConnection = () => {
        console.log('make a connection', from, to);

        setIsBottomDrawerExpanded(true);
    };

    const handleDrawerCloseButtonClick = () => {
        // eslint-disable-next-line no-restricted-globals
        const confirmCancel = confirm('Are you sure you want to clear the connection creation?');

        if (confirmCancel) {
            console.log('Connection cancelled.');

            dispatch(toggleBottomConnectionDrawer(false));
        } else {
            console.log("Don't cancel connection.");
        }
    };

    const FromThumbnailDetailPresenter = !isNullOrUndefined(from)
        ? thumbnailCategorizableDetailPresenterFactory(from.type as ResourceType)
        : null;

    const ToThumbnailDetailPresenter = !isNullOrUndefined(to)
        ? thumbnailCategorizableDetailPresenterFactory(to.type as ResourceType)
        : null;

    return (
        <Box>
            <Drawer
                PaperProps={{
                    sx: {
                        minHeight: isBottomDrawerExpanded ? '80vh' : '40vh',
                        width: '90vw',
                        margin: 'auto',
                        p: 2,
                        borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '20px 20px 0px 0px',
                    },
                }}
                anchor="bottom"
                open={open}
                variant="persistent"
            >
                <DrawerHeader>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <BlinkingStatusDot />
                        <Box sx={{ mb: 2, ml: 2 }}>
                            <Typography variant="h3" sx={{ mb: 0 }}>
                                Connect Resources
                            </Typography>
                            <Typography variant="h5" sx={{ mb: 0 }}>
                                Browse to a new resource and then click the ADD SECOND RESOURCE
                                button to create a new connection with note.
                            </Typography>
                        </Box>
                    </Box>
                    <Box>
                        {/* <Tooltip title="Expand/Contract Connection Maker Panel">
                            <IconButton
                                data-testid="expand-notes-panel-button"
                                onClick={() => {
                                    setIsBottomDrawerExpanded(!isBottomDrawerExpanded);
                                }}
                            >
                                {isBottomDrawerExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                            </IconButton>
                        </Tooltip> */}
                        <Tooltip title="Close Notes Panel">
                            <IconButton
                                data-testid="close-notes-panel-button"
                                onClick={handleDrawerCloseButtonClick}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </DrawerHeader>
                <Divider variant="fullWidth" sx={{ mb: 3 }} />
                <Grid container spacing={2} sx={{ ml: 2, mr: 2 }}>
                    <Grid item xs={6}>
                        {!isNullOrUndefined(from) ? (
                            <FromThumbnailDetailPresenter
                                id={from.id}
                                shouldDisplayActionButtons={false}
                            />
                        ) : null}
                    </Grid>
                    <Grid item xs={6}>
                        {!isNullOrUndefined(to) ? (
                            <>
                                <ToThumbnailDetailPresenter
                                    id={to.id}
                                    shouldDisplayActionButtons={false}
                                />
                                <Tooltip title="Connect Resources with Note">
                                    <Button
                                        startIcon={<AddIcon />}
                                        data-testid="connect-resources-button"
                                        onClick={() => handleMakeConnection()}
                                    >
                                        CONNECT RESOURCES
                                    </Button>
                                </Tooltip>
                            </>
                        ) : (
                            <Typography variant="h5">"To" resource not selected</Typography>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        {!isNullOrUndefined(to) ? (
                            <CreateConnectionWithNoteForm from={from} to={to} />
                        ) : null}
                    </Grid>
                </Grid>
            </Drawer>
        </Box>
    );
};
