import { Box, styled } from '@mui/material';
import { useState } from 'react';
import { calculatePositionAsPercentage } from './calculate-percent-progress';
import { EDITOR_SOUND_BAR_HEIGHT } from './constants';
import { TimeRangeClip } from './timeline';

const StyledRangeBar = styled('span')({
    height: `${EDITOR_SOUND_BAR_HEIGHT - 2}px`,
    position: 'relative',
    backgroundColor: '#0bccf9',
    opacity: 0.7,
    borderRadius: '5px',
    boxSizing: 'border-box',
    display: 'inline-block',
    overflow: 'hidden',
    cursor: 'pointer',
});

interface RangeBarProps {
    durationSeconds: number;
    timeRangeClip: TimeRangeClip;
}

export const RangeBar = ({ durationSeconds, timeRangeClip }: RangeBarProps): JSX.Element => {
    const [activeRange, setActiveRange] = useState<boolean>(false);

    const {
        timeRangeSeconds: { inPointSeconds, outPointSeconds },
        label,
    } = timeRangeClip;

    const rangeStart = calculatePositionAsPercentage(inPointSeconds, durationSeconds);

    const rangeLength =
        calculatePositionAsPercentage(outPointSeconds, durationSeconds) - rangeStart;

    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        setActiveRange(!activeRange);
    };

    return (
        <StyledRangeBar
            sx={{
                left: `${rangeStart}%`,
                width: `${rangeLength}%`,
                border: activeRange ? '2px solid #fdec5e' : '1px solid blue',
            }}
            onClick={handleClick}
        >
            <Box sx={{ display: 'flex' }}>
                {label}
                <Box>...</Box>
            </Box>
        </StyledRangeBar>
    );
};
