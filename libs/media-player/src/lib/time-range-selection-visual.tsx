import { Box, styled } from '@mui/material';

export type TimeRangeVisualState = 'inPointSelected' | 'timeRangeSelected' | null;

const Bar = styled(Box)({
    height: '20px',
    minWidth: '150px',
    margin: '0 auto',
    borderLeft: '3px solid #0671ff',
    borderRadius: '5px',
    position: 'absolute',
});

interface TimeRangeSelectionVisualProps {
    timeRangeVisualState: TimeRangeVisualState;
}

export const TimeRangeSelectionVisual = ({
    timeRangeVisualState,
}: TimeRangeSelectionVisualProps): JSX.Element => {
    const isBarVisible = (bar: TimeRangeVisualState) => {
        return bar === timeRangeVisualState;
    };

    return (
        <>
            <Bar
                data-testid="inpoint-selected-bar"
                sx={{
                    backgroundImage: 'linear-gradient(to right, #75ecff, #fff)',
                    visibility: isBarVisible('inPointSelected') ? 'visible' : 'hidden',
                }}
            >
                &nbsp;
            </Bar>
            <Bar
                data-testid="timerange-selected-bar"
                sx={{
                    backgroundColor: '#75ecff',
                    borderRight: '2px solid #0671ff',
                    visibility: isBarVisible('timeRangeSelected') ? 'visible' : 'hidden',
                }}
            >
                &nbsp;
            </Bar>
        </>
    );
};
