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
    alignItems: 'center',
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
            <Drawer anchor="right" variant="persistent" open={rightSideDrawerOpen}>
                <DrawerHeader>
                    <Typography variant="h2">
                        Connections for {resourceType}/{id}
                    </Typography>
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
            <Drawer anchor="bottom" variant="persistent" open={bottomDrawerOpen}>
                <DrawerHeader>
                    <Typography variant="h2">
                        Notes for {resourceType}/{id}
                    </Typography>
                    <Tooltip title="Close Panel">
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
