import { AggregateCompositeIdentifier } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    Close as CloseIcon,
    Hub as HubIcon,
    TextSnippet as TextSnippetIcon,
} from '@mui/icons-material';
import { Box, Drawer, IconButton, Stack, Tooltip, Typography, styled } from '@mui/material';
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
    margin: theme.spacing(0, 0, 0, 4),
}));

export const CategorizablePageLayout = ({
    compositeIdentifier: { type: resourceType, id },
    selfNotesList,
    connectedResourcesList,
    commandPanel,
    children,
}: CategorizablePageLayoutProps) => {
    const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);
    const [rightSideDrawerOpen, setRightSideDrawerOpen] = useState(false);

    return (
        <>
            {children}
            <Box sx={{ textAlign: 'right', pr: 8, mb: 8 }}>
                <Tooltip title="Open Notes Panel">
                    <IconButton
                        onClick={() => {
                            setBottomDrawerOpen(!bottomDrawerOpen);
                        }}
                    >
                        <TextSnippetIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Open Connected Resources Panel">
                    <IconButton
                        onClick={() => {
                            setRightSideDrawerOpen(!rightSideDrawerOpen);
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
                variant="persistent"
                data-testid="connected-resources-panel"
                open={rightSideDrawerOpen}
            >
                <DrawerHeader>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="h3" sx={{ mb: 0 }}>
                            Connected Resources
                        </Typography>
                        <Typography variant="subtitle2">
                            {/* TODO: Remove this, it is for troubleshooting purposes only */}
                            for {resourceType}/{id}
                        </Typography>
                    </Box>
                    <Tooltip title="Close Panel">
                        <IconButton
                            onClick={() => {
                                setRightSideDrawerOpen(!rightSideDrawerOpen);
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </DrawerHeader>
                <DrawerContentStack>{connectedResourcesList}</DrawerContentStack>
            </Drawer>
            <Drawer
                anchor="bottom"
                PaperProps={{
                    sx: {
                        height: '30vh',
                        width: '90vw',
                        margin: 'auto',
                        borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                        borderRadius: '20px 20px 0px 0px',
                    },
                }}
                variant="persistent"
                data-testid="notes-panel"
                open={bottomDrawerOpen}
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
                    <Tooltip title="Close Notes Panel">
                        <IconButton
                            onClick={() => {
                                setBottomDrawerOpen(!bottomDrawerOpen);
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                </DrawerHeader>
                <DrawerContentStack>{selfNotesList}</DrawerContentStack>
            </Drawer>
            {!isNullOrUndefined(CommandPanel) ? <>{commandPanel}</> : null}
        </>
    );
};
