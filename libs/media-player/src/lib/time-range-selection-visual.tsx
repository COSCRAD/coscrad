import { Box, styled } from '@mui/material';

export type TimeRangeSelectionStatus = 'inPointOnly' | 'fullSelection' | 'noSelection';

const Bar = styled(Box)({
    height: '20px',
    minWidth: '150px',
    margin: '0 auto',
    borderLeft: '3px solid #0671ff',
    borderRadius: '5px',
    position: 'absolute',
});

interface TimeRangeSelectionStatusIndicatorProps {
    timeRangeSelectionStatus: TimeRangeSelectionStatus;
}

export const TimeRangeSelectionStatusIndicator = ({
    timeRangeSelectionStatus,
}: TimeRangeSelectionStatusIndicatorProps): JSX.Element => {
    const isBarVisible = (bar: TimeRangeSelectionStatus) => {
        return bar === timeRangeSelectionStatus;
    };

    return (
        <>
            <Bar
                data-testid="inpoint-selected-bar"
                sx={{
                    backgroundImage: 'linear-gradient(to right, #75ecff, #fff)',
                    visibility: isBarVisible('inPointOnly') ? 'visible' : 'hidden',
                }}
            >
                &nbsp;
            </Bar>
            <Bar
                data-testid="timerange-selected-bar"
                sx={{
                    backgroundColor: '#75ecff',
                    borderRight: '3px solid #0671ff',
                    visibility: isBarVisible('fullSelection') ? 'visible' : 'hidden',
                }}
            >
                &nbsp;
            </Bar>
        </>
    );
};
