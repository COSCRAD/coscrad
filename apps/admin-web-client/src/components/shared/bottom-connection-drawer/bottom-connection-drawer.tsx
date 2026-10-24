import { ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    Close as CloseIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import HubIcon from '@mui/icons-material/Hub';
import { Box, Divider, Drawer, Grid, IconButton, Tooltip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { thumbnailCategorizableDetailPresenterFactory } from '../../resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { BlinkingStatusDot } from '../blinking-badge/blinking-status-dot';
import {
    DrawerOpenStateEnum,
    selectIsConnectionOpen,
    toggleBottomConnectionDrawer,
} from '../store/connection.slice';
import {
    BOTTOM_DRAWER_HEIGHT_HIGH,
    BOTTOM_DRAWER_HEIGHT_LOW,
    BOTTOM_DRAWER_HEIGHT_MID,
} from './constants';
import { CreateConnectionWithNoteForm } from './create-connection-with-note-form';

export const BottomConnectionDrawer = (): JSX.Element => {
    const dispatch = useDispatch();

    const drawerRef = useRef(null);

    const [drawerHeight, setDrawerHeight] = useState<number>(BOTTOM_DRAWER_HEIGHT_LOW);

    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const openConnectionResource: boolean = useSelector(selectIsConnectionOpen);

    const {
        drawerOpenStateFromSlice,
        connectionMembers: { from, to },
    } = useSelector((state: RootState) => state.connectionSlice);

    const toggleDrawerHeight = () => {
        console.log('toggleDrawerHeight', drawerOpenStateFromSlice);

        if (
            drawerOpenStateFromSlice === DrawerOpenStateEnum.expandedLarge ||
            drawerOpenStateFromSlice === DrawerOpenStateEnum.expandedMid
        ) {
            dispatch(toggleBottomConnectionDrawer(DrawerOpenStateEnum.expandedSmall));
        } else if (isNullOrUndefined(to?.id)) {
            dispatch(toggleBottomConnectionDrawer(DrawerOpenStateEnum.expandedMid));
        } else {
            dispatch(toggleBottomConnectionDrawer(DrawerOpenStateEnum.expandedLarge));
        }
    };

    useEffect(() => {
        console.log({ drawerOpenState: drawerOpenStateFromSlice });

        if (isDrawerOpen && drawerRef.current) {
            console.log('giving drawer focus');

            drawerRef.current.focus();
        }

        if (drawerOpenStateFromSlice !== DrawerOpenStateEnum.closed) {
            setIsDrawerOpen(true);

            switch (drawerOpenStateFromSlice) {
                case DrawerOpenStateEnum.expandedMid:
                    setDrawerHeight(BOTTOM_DRAWER_HEIGHT_MID);

                    break;
                case DrawerOpenStateEnum.expandedLarge:
                    setDrawerHeight(BOTTOM_DRAWER_HEIGHT_HIGH);

                    break;
                case DrawerOpenStateEnum.expandedSmall:
                    setDrawerHeight(BOTTOM_DRAWER_HEIGHT_LOW);

                    break;
            }
        } else {
            setIsDrawerOpen(false);
        }
    }, [isDrawerOpen, setIsDrawerOpen, drawerOpenStateFromSlice, drawerHeight]);

    const handleDrawerCloseButtonClick = () => {
        // eslint-disable-next-line no-restricted-globals
        const confirmCancel = confirm('Are you sure you want to clear the connection creation?');

        if (confirmCancel) {
            console.log('Connection cancelled.');

            dispatch(toggleBottomConnectionDrawer(DrawerOpenStateEnum.closed));

            setIsDrawerOpen(false);
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
        <Drawer
            PaperProps={{
                sx: {
                    height: `${drawerHeight}vh`,
                    width: '90vw',
                    margin: 'auto',
                    p: 4,
                    borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                    borderRadius: '20px 20px 0px 0px',
                    overflow: 'hidden',
                },
            }}
            anchor="bottom"
            open={isDrawerOpen}
            variant="persistent"
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    margin: '2, 4, 0, 4',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <BlinkingStatusDot />
                    <Box sx={{ mb: 2, ml: 2 }}>
                        <Typography variant="h3" sx={{ mb: 0 }}>
                            Connect Resources
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <Tooltip title="Expand/Contract Connection Maker Panel">
                        <IconButton
                            data-testid="expand-notes-panel-button"
                            onClick={() => {
                                toggleDrawerHeight();
                            }}
                        >
                            {/* Expand Icons are reversed for bottom drawer use case */}
                            {drawerHeight === BOTTOM_DRAWER_HEIGHT_HIGH ||
                            drawerHeight === BOTTOM_DRAWER_HEIGHT_MID ? (
                                <ExpandMoreIcon />
                            ) : (
                                <ExpandLessIcon />
                            )}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Close Notes Panel">
                        <IconButton
                            data-testid="close-notes-panel-button"
                            onClick={handleDrawerCloseButtonClick}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
            <Divider variant="fullWidth" sx={{ mb: 3 }} />
            <Grid container spacing={2}>
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
                        <ToThumbnailDetailPresenter id={to.id} shouldDisplayActionButtons={false} />
                    ) : (
                        <Typography variant="h5" sx={{ mb: 0 }}>
                            Now browse to a new resource and then click its Create Connection
                            <HubIcon
                                sx={{
                                    display: 'inline',
                                    fontSize: '20px',
                                    color: '#A40011',
                                    ml: 1,
                                    mr: 1,
                                }}
                            />
                            button.
                        </Typography>
                    )}
                </Grid>
                <Grid item xs={12}>
                    {!isNullOrUndefined(to) ? (
                        <CreateConnectionWithNoteForm from={from} to={to} />
                    ) : null}
                </Grid>
            </Grid>
        </Drawer>
    );
};
