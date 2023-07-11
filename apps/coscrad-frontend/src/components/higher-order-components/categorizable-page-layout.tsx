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
import { ReactNode, useState } from 'react';
import { CommandPanel } from '../commands';

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

const DrawerContentStack = styled(Stack)(({ theme }) => ({
    margin: theme.spacing(0, 4, 0, 4),
    overflow: 'scroll',
}));

type Anchor = 'top' | 'left' | 'bottom' | 'right';

export const CategorizablePageLayout = ({
    compositeIdentifier: { type: resourceType, id },
    selfNotesList,
    connectedResourcesList,
    commandPanel,
    children,
}: CategorizablePageLayoutProps) => {
    const [drawerState, setDrawerState] = useState({
        bottom: false,
        right: false,
    });
    const [isBottomDrawerExpanded, setIsBottomDrawerExpanded] = useState(false);

    const toggleDrawer = (anchor: Anchor, isOpen: boolean) => {
        setDrawerState({ ...drawerState, [anchor]: isOpen });
    };

    // const toggleBottomDrawerSize = (isBottomDrawerExpanded) => {
    //     if (isBottomDrawerExpanded) {

    //     }
    //     setIsBottomDrawerExpanded(isBottomDrawerExpanded);
    // };

    return (
        <>
            {children}
            <Box sx={{ textAlign: 'right', pr: 8, mb: 8 }}>
                <Tooltip title="Open Notes Panel">
                    <IconButton
                        onClick={() => {
                            toggleDrawer('bottom', !drawerState['bottom']);
                        }}
                    >
                        <TextSnippetIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Open Connected Resources Panel">
                    <IconButton
                        onClick={() => {
                            toggleDrawer('right', !drawerState['right']);
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
                open={drawerState['right']}
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
                            onClick={() => {
                                toggleDrawer('right', false);
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
                open={drawerState['bottom']}
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
                                onClick={() => {
                                    setIsBottomDrawerExpanded(!isBottomDrawerExpanded);
                                }}
                            >
                                {isBottomDrawerExpanded ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Close Notes Panel">
                            <IconButton
                                onClick={() => {
                                    toggleDrawer('bottom', false);
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
            {!isNullOrUndefined(CommandPanel) ? <>{commandPanel}</> : null}
        </>
    );
};
