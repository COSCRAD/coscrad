import { styled } from '@mui/material';
import { useState } from 'react';

const StyledRangeBar = styled('span')({
    position: 'absolute',
    backgroundColor: '#888',
    opacity: 0.7,
    borderRadius: '5px',
});

export const RangeBar = (): JSX.Element => {
    const [activeRange, setActiveRange] = useState<HTMLSpanElement>();

    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        console.log({ style: event.currentTarget.style });

        setActiveRange(event.currentTarget);
    };

    return <StyledRangeBar onClick={handleClick}>rangebar</StyledRangeBar>;
};
