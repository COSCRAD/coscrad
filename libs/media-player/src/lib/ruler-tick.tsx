/**
 * This file may be deprecated
 */

import { styled } from '@mui/material';
import { asFormattedMediaTimecodeString } from './shared/as-formatted-media-timecode-string';

const NUMBERED_TICK_HEIGHT = 27;

const REGULAR_TICK_HEIGHT = 10;

const NUMBER_PADDING_FROM_TICK = 4;

export const RULER_TICKS_AND_NUMBERS_COLOR = '#178e06';

const StyledRulerTick = styled('div')({
    width: '1px',
    minHeight: '5px',
    backgroundColor: RULER_TICKS_AND_NUMBERS_COLOR,
    position: 'absolute',
    bottom: 0,
    zIndex: 600,
});

const StyledRulerNumber = styled('div')({
    color: RULER_TICKS_AND_NUMBERS_COLOR,
    fontSize: '12px',
    marginBottom: '3px',
    position: 'absolute',
    zIndex: 600,
});

interface RulerTickProps {
    index: number;
    rulerTickOffset: number;
}

export const RulerTick = ({ index, rulerTickOffset }: RulerTickProps): JSX.Element => {
    const tickHeight = index % 10 === 0 ? `${NUMBERED_TICK_HEIGHT}px` : `${REGULAR_TICK_HEIGHT}px`;

    // TODO the modulus factor should change with the zoom factor
    const showNumber = index % 5 === 0 ? true : false;

    const left = index * rulerTickOffset;

    return (
        <>
            {showNumber ? (
                <StyledRulerNumber sx={{ left: `${left + NUMBER_PADDING_FROM_TICK}px` }}>
                    {asFormattedMediaTimecodeString(index)}
                </StyledRulerNumber>
            ) : null}
            <StyledRulerTick sx={{ height: tickHeight, left: `${left}px` }} />
        </>
    );
};
