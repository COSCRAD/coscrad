import { styled } from '@mui/material';
import { useState } from 'react';
import { calculatePercentProgress } from './calculate-percent-progress';
import { EDITOR_SOUND_BAR_HEIGHT } from './media-timeline-constants';

const StyledRangeBar = styled('span')({
    height: `${EDITOR_SOUND_BAR_HEIGHT}px`,
    position: 'absolute',
    backgroundColor: '#888',
    opacity: 0.7,
    borderRadius: '5px',
    boxSizing: 'border-box',
});

interface RangeBarProps {
    mediaDuration: number;
    selectionStartMilliseconds: number;
    selectionEndMilliseconds: number;
}

export const RangeBar = ({
    mediaDuration,
    selectionStartMilliseconds,
    selectionEndMilliseconds,
}: RangeBarProps): JSX.Element => {
    const [activeRange, setActiveRange] = useState<boolean>(false);

    const rangeStart = calculatePercentProgress(selectionStartMilliseconds / 1000, mediaDuration);

    const rangeLength =
        calculatePercentProgress(selectionEndMilliseconds / 1000, mediaDuration) - rangeStart;

    const handleClick = () => {
        setActiveRange(!activeRange);
    };

    return (
        <StyledRangeBar
            sx={{
                left: `${rangeStart}%`,
                width: `${rangeLength}%`,
                border: activeRange ? '2px solid #fdec5e' : 'none',
            }}
            onClick={handleClick}
        />
    );
};
