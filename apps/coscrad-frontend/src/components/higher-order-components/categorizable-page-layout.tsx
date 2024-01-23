import { AggregateCompositeIdentifier } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    Close as CloseIcon,
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    Hub as HubIcon,
    TextSnippet as TextSnippetIcon,
} from '@mui/icons-material';
import {
    Box,
    Divider,
    Drawer,
    IconButton,
    Stack,
    Tooltip,
    Typography,
    styled,
} from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';

interface CategorizablePageLayoutProps {
    compositeIdentifier: AggregateCompositeIdentifier;
    selfNotesList: JSX.Element;
    connectedResourcesList: JSX.Element;
    commandPanel?: JSX.Element;
    children: ReactNode;
}

const DrawerHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    margin: theme.spacing(2, 4, 0, 4),
    justifyContent: 'space-between',
}));

const drawerContentStackMargin = {
    top: 0,
    right: 4,
    bottom: 0,
    left: 4,
};

const DrawerContentStack = styled(Stack)(({ theme }) => ({
    margin: theme.spacing(
        drawerContentStackMargin.top,
        drawerContentStackMargin.right,
        drawerContentStackMargin.bottom,
        drawerContentStackMargin.left
    ),
    overflow: 'scroll',
}));

type AnchorLocation = 'bottom' | 'right';

type UXState = {
    openPanelLocation: AnchorLocation | null;
};

const isPanelOpen = (location: AnchorLocation, { openPanelLocation }: UXState) =>
    openPanelLocation === location;

export const CategorizablePageLayout = ({
    compositeIdentifier: { type: resourceType, id },
    selfNotesList,
    connectedResourcesList,
    commandPanel,
    children,
}: CategorizablePageLayoutProps) => {
    const [drawerState, setDrawerState] = useState<UXState>({
        openPanelLocation: null,
    });

    /**
     * HACK: We need to figure out why this component isn't rerendered every
     * time you navigate to a new categorizable page
     */
    useEffect(() => {
        setDrawerState({
            openPanelLocation: null,
        });
    }, [id]);

    const toggleDrawer = (anchor: AnchorLocation) => {
        const isOpen = isPanelOpen(anchor, drawerState);

        if (isOpen) {
            setDrawerState({ openPanelLocation: null });
        } else {
            setDrawerState({ openPanelLocation: anchor });
        }
    };

    const [isBottomDrawerExpanded, setIsBottomDrawerExpanded] = useState(false);

    return (
        <div>
            {children}
            <Box sx={{ textAlign: 'right', pr: 8, mb: 8 }}>
                <Tooltip title="Open Notes Panel">
                    <IconButton
                        data-testid="open-notes-panel-button"
                        onClick={() => {
                            toggleDrawer('bottom');
                        }}
                    >
                        <TextSnippetIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Open Connected Resources Panel">
                    <IconButton
                        data-testid="open-connected-resources-panel-button"
                        onClick={() => {
                            toggleDrawer('right');
                        }}
                    >
                        <HubIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Drawer
                anchor="right"
                PaperProps={{
                    sx: { width: '35vw' },
                }}
                variant="temporary"
                data-testid="connected-resources-panel"
                open={isPanelOpen('right', drawerState)}
            >
                <DrawerHeader>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" sx={{ mb: 0 }}>
                            Connected Resources
                        </Typography>
                        <Typography variant="subtitle2">
                            {/* TODO: Remove this in future, it is for troubleshooting purposes only */}
                            for {resourceType}/{id}
                        </Typography>
                    </Box>
                    <Tooltip title="Close Panel">
                        <IconButton
                            data-testid="close-connected-resources-panel-button"
                            onClick={() => {
                                toggleDrawer('right');
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </DrawerHeader>
                <Divider variant="fullWidth" sx={{ mb: 3 }} />
                <DrawerContentStack>{connectedResourcesList}</DrawerContentStack>
            </Drawer>
            <Drawer
                anchor="bottom"
                PaperProps={{
                    sx: {
                        height: isBottomDrawerExpanded ? '80vh' : '40vh',
                        width: '90vw',
                        margin: 'auto',
                        borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '20px 20px 0px 0px',
                    },
                }}
                variant="temporary"
                data-testid="notes-panel"
                open={isPanelOpen('bottom', drawerState)}
            >
                <DrawerHeader>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" sx={{ mb: 0 }}>
                            Notes
                        </Typography>
                        <Typography variant="subtitle2">
                            for {resourceType}/{id}
                        </Typography>
                    </Box>
                    <Box>
                        <Tooltip title="Expand/Contract Notes Panel">
                            <IconButton
                                data-testid="expand-notes-panel-button"
                                onClick={() => {
                                    setIsBottomDrawerExpanded(!isBottomDrawerExpanded);
                                }}
                            >
                                {isBottomDrawerExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Close Notes Panel">
                            <IconButton
                                data-testid="close-notes-panel-button"
                                onClick={() => {
                                    toggleDrawer('bottom');
                                }}
                            >
                                <CloseIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </DrawerHeader>
                <Divider variant="fullWidth" sx={{ mb: 3 }} />
                <DrawerContentStack>{selfNotesList}</DrawerContentStack>
            </Drawer>
            {!isNullOrUndefined(commandPanel) ? commandPanel : null}
        </div>
    );
};
