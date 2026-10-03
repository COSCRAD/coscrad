import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import { createContext, useContext, useState } from 'react';

// 1. Create Context
const RightSidePanelContext = createContext(undefined);

// 2. Provider Component
export const RightSidePanelProvider = ({ children }) => {
    const [isRightSidePanelOpen, setIsRightSidePanelOpen] = useState(false);
    const [panelTitle, setPanelTitle] = useState('');
    const [panelContent, setPanelContent] = useState(null);

    // Enhanced open function to accept both a title and body content
    const openRightSidePanel = (title = '', content = null) => {
        setPanelTitle(title);
        setPanelContent(content);
        setIsRightSidePanelOpen(true);
    };

    const closeRightSidePanel = () => {
        setIsRightSidePanelOpen(false);
    };

    return (
        <RightSidePanelContext.Provider
            value={{
                isRightSidePanelOpen,
                openRightSidePanel,
                closeRightSidePanel,
                panelTitle,
                panelContent,
            }}
        >
            {children}
            <MuiSidePanel />
        </RightSidePanelContext.Provider>
    );
};

export const useRightSidePanel = () => {
    const context = useContext(RightSidePanelContext);
    if (!context) {
        throw new Error('useSidePanel must be used within a SidePanelProvider');
    }
    return context;
};

// Internal MUI Drawer Component
const MuiSidePanel = () => {
    const { isRightSidePanelOpen, closeRightSidePanel, panelTitle, panelContent } =
        useRightSidePanel();

    return (
        <Drawer
            anchor="right" // Slides in from the right edge
            open={isRightSidePanelOpen}
            onClose={closeRightSidePanel} // Closes when clicking the backdrop overlay
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 } }, // Responsive widths
            }}
        >
            {/* Header Container */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderBottom: '1px solid #e0e0e0',
                }}
            >
                <Typography variant="h6" component="h2">
                    {panelTitle || 'Side Panel'}
                </Typography>
                <IconButton onClick={closeRightSidePanel} aria-label="close side panel">
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Main Content Body */}
            <Box sx={{ p: 3, flexGrow: 1, overflowY: 'auto' }}>{panelContent}</Box>
        </Drawer>
    );
};
