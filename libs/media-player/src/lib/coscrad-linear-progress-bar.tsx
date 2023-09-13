import { Box, styled } from '@mui/material';
import { useEffect } from 'react';

const LinearProgressBarContainer = styled('div')({
    height: '10px',
    width: '100%',
    backgroundColor: '#ccc',
});

const LinearProgressBar = styled(Box)({
    height: '10px',
    width: '0%',
    position: 'relative',
});

interface CoscradLinearProgressBarProps {
    buffer: number;
    progress: number;
    seekInProgressBar: (progressSelected: number) => void;
}

export const CoscradLinearProgressBar = ({
    buffer,
    progress,
    seekInProgressBar,
}: CoscradLinearProgressBarProps) => {
    // Consider breaking out progress bar colours as customizable theme palettes

    const handleSeekInProgressBar = (event: React.MouseEvent<HTMLSpanElement>) => {
        const progressSelected =
            (event.clientX - event.currentTarget.offsetLeft) / event.currentTarget.offsetWidth;

        seekInProgressBar(progressSelected);
    };

    useEffect(() => {});

    return (
        <LinearProgressBarContainer onClick={(event) => handleSeekInProgressBar(event)}>
            <LinearProgressBar sx={{ width: `${buffer}%`, backgroundColor: 'info.main' }} />
            <LinearProgressBar
                sx={{
                    top: '-10px',
                    width: `${progress}%`,
                    backgroundColor: 'primary.main',
                }}
            />
        </LinearProgressBarContainer>
    );
};
