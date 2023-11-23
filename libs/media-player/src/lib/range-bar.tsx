import { styled } from '@mui/material';
import { useState } from 'react';
import { EDITOR_SOUND_BAR_HEIGHT } from './editor-constants';
import { calculatePercentProgress } from './video-prototype-player';

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
    inPointMilliseconds: number;
    outPointMilliseconds: number;
}

export const RangeBar = ({
    mediaDuration,
    inPointMilliseconds,
    outPointMilliseconds,
}: RangeBarProps): JSX.Element => {
    const [activeRange, setActiveRange] = useState<boolean>(false);

    const rangeStart = calculatePercentProgress(inPointMilliseconds / 1000, mediaDuration);

    const rangeLength =
        calculatePercentProgress(outPointMilliseconds / 1000, mediaDuration) - rangeStart;

    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
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
