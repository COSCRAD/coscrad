import { styled } from '@mui/material';
import { useState } from 'react';
import { EDITOR_SOUND_BAR_HEIGHT } from './editor-constants';

const StyledRangeBar = styled('span')({
    height: `${EDITOR_SOUND_BAR_HEIGHT}px`,
    position: 'absolute',
    backgroundColor: '#888',
    opacity: 0.7,
    borderRadius: '5px',
    boxSizing: 'border-box',
});

export const RangeBar = (): JSX.Element => {
    const [activeRange, setActiveRange] = useState<boolean>(false);

    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        console.log({ style: event.currentTarget.style });

        setActiveRange(!activeRange);
    };

    return (
        <StyledRangeBar
            sx={{ width: '120px', border: activeRange ? '2px solid #fdec5e' : 'none' }}
            onClick={handleClick}
        />
    );
};
