import { Box, styled } from '@mui/material';
import { useState } from 'react';
import { EDITOR_SOUND_BAR_HEIGHT } from './constants';
import { convertTimecodeToTimelineUnits } from './convert-timecode-to-timeline-units';
import { TimeRangeClip } from './timeline';

const StyledRangeBar = styled('span')({
    height: `${EDITOR_SOUND_BAR_HEIGHT - 2}px`,
    position: 'absolute',
    backgroundColor: '#0bccf9',
    opacity: 0.7,
    borderRadius: '5px',
    boxSizing: 'border-box',
    display: 'inline-block',
    overflow: 'hidden',
    cursor: 'pointer',
});

interface RangeBarProps {
    renderedTimelineLength: number;
    durationSeconds: number;
    timeRangeClip: TimeRangeClip;
}

export const RangeBar = ({
    renderedTimelineLength,
    durationSeconds,
    timeRangeClip,
}: RangeBarProps): JSX.Element => {
    const [activeRange, setActiveRange] = useState<boolean>(false);

    const {
        timeRangeSeconds: { inPointSeconds, outPointSeconds },
        label,
    } = timeRangeClip;

    const rangeStart = convertTimecodeToTimelineUnits(
        renderedTimelineLength,
        inPointSeconds,
        durationSeconds
    );

    const rangeLength =
        convertTimecodeToTimelineUnits(renderedTimelineLength, outPointSeconds, durationSeconds) -
        rangeStart;

    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        setActiveRange(!activeRange);
    };

    return (
        <StyledRangeBar
            sx={{
                left: `${rangeStart}px`,
                width: `${rangeLength}px`,
                border: activeRange ? '2px solid #fdec5e' : '1px solid blue',
            }}
            onClick={handleClick}
        >
            <Box sx={{ display: 'flex' }}>{label}</Box>
        </StyledRangeBar>
    );
};
