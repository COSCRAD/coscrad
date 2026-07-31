import { AudioPlayer } from '@coscrad/media-player';
import { PlayArrowRounded } from '@mui/icons-material';
import { Box, Drawer } from '@mui/material';
import { useState } from 'react';

interface AudioPanelProps {
    url: string;
}

const AudioPanel = ({ url }: AudioPanelProps): JSX.Element => {
    const [open, setOpen] = useState(false);

    const toggleDrawer = () => {
        setOpen(!open);
    };
    return (
        <Box>
            <Box onClick={toggleDrawer}>
                <PlayArrowRounded />
            </Box>

            <Drawer anchor="bottom" open={open} onClose={toggleDrawer} variant="persistent">
                <Box sx={{ background: '#EDEDED' }}>
                    <AudioPlayer audioUrl={url} />
                </Box>
            </Drawer>
        </Box>
    );
};

export default AudioPanel;
