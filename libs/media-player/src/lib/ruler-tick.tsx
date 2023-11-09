import { styled } from '@mui/material';
import { FormattedCurrentTime } from './formatted-currenttime';

const NUMBERED_TICK_HEIGHT = 27;

const REGULAR_TICK_HEIGHT = 10;

const NUMBER_PADDING_FROM_TICK = 4;

const StyledRulerTick = styled('div')({
    width: '1px',
    minHeight: '5px',
    backgroundColor: '#4914db',
    position: 'absolute',
    bottom: 0,
    zIndex: 600,
});

const StyledRulerNumber = styled('div')({
    color: '#4914db',
    fontSize: '12px',
    marginBottom: '3px',
    position: 'absolute',
    zIndex: 600,
});

interface RulerTickProps {
    index: number;
    zoomFactor: number;
}

export const RulerTick = ({ index, zoomFactor }: RulerTickProps): JSX.Element => {
    const tickHeight = index % 10 === 0 ? `${NUMBERED_TICK_HEIGHT}px` : `${REGULAR_TICK_HEIGHT}px`;

    const showNumber = index % 10 === 0 ? true : false;

    return (
        <>
            {showNumber ? (
                <StyledRulerNumber
                    sx={{ left: `${index * zoomFactor + NUMBER_PADDING_FROM_TICK}px` }}
                >
                    <FormattedCurrentTime currentTimeInSeconds={index} />
                </StyledRulerNumber>
            ) : null}
            <StyledRulerTick sx={{ height: tickHeight, left: `${index * zoomFactor}px` }} />
        </>
    );
};
