import { Box } from '@mui/material';

export type TimeRangeVisualState = 'inPointSelected' | 'timeRangeSelected' | null;

interface TimeRangeSelectionVisualProps {
    inPointSeconds: number;
    outPointSeconds: number;
}

export const TimeRangeSelectionVisual = ({
    inPointSeconds,
    outPointSeconds,
}: TimeRangeSelectionVisualProps): JSX.Element => {
    const isBarVisible = (bar: TimeRangeVisualState) => {
        return bar === timeRangeVisualState;
    };

    return (
        <>
            <Box
                data-testid="inpoint-selected-bar"
                sx={{
                    backgroundImage: 'linear-gradient(to right, #75ecff, #fff)',
                    borderLeft: '1px solid #0671ff',
                    visibility: isBarVisible('inPointSelected') ? 'visible' : 'hidden',
                }}
            >
                &nbsp;
            </Box>
            <Box
                data-testid="timerange-selected-bar"
                sx={{
                    backgroundColor: '#75ecff',
                    borderRight: '1px solid #0671ff',
                    borderLeft: '1px solid #0671ff',
                    visibility: isBarVisible('timeRangeSelected') ? 'visible' : 'hidden',
                }}
            >
                &nbsp;
            </Box>
        </>
    );
};
