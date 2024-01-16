import { EdgeConnectionContextType, IEdgeConnectionContext } from '@coscrad/api-interfaces';
import { asFormattedMediaTimecodeString } from '@coscrad/media-player';
import { Box, Typography } from '@mui/material';
import { TimeRangeMilliseconds } from '../../../../../components/resources/audio-item/audio-item-detail.full-view.presenter';
import { convertMillisecondsToSeconds } from '../../../../../components/resources/utils/math';

// Share via lib to frontend and backend
const upperCaseFirstLetter = (str: string) => {
    return str
        .split(' ')
        .map((word) => [word.charAt(0).toUpperCase(), word.slice(1)].join(''))
        .join(' ');
};

const TimeRangeContextVisual = (): JSX.Element => (
    <Box
        component="span"
        sx={{
            height: '20px',
            width: '70px',
            backgroundColor: '#75ecff',
            borderRight: '1px solid #0671ff',
            borderLeft: '1px solid #0671ff',
            borderRadius: '5px',
            display: 'inline-block',
            ml: 1,
            mr: 1,
        }}
    />
);

type TimeRangeContext = {
    type: EdgeConnectionContextType.timeRange;
    timeRange: TimeRangeMilliseconds;
};

interface EdgeConnectionContextPresenterProps {
    context: IEdgeConnectionContext;
}

/**
 * NOTE: This presenter is a temporary step before properly implementing
 * context using a `noteContext` in the base resource detail view interface and
 * implement it for all detail views
 */
export const EdgeConnectionContextPresenter = ({
    context,
}: EdgeConnectionContextPresenterProps): JSX.Element => {
    const { type } = context;

    if (type === EdgeConnectionContextType.timeRange) {
        const {
            timeRange: { inPointMilliseconds, outPointMilliseconds },
        } = context as TimeRangeContext;

        return (
            <Box
                sx={{ display: 'flex', alignItems: 'center' }}
                data-testid="self-note-time-range-context"
            >
                <strong>Time Range:</strong>&nbsp;
                {asFormattedMediaTimecodeString(convertMillisecondsToSeconds(inPointMilliseconds))}
                <TimeRangeContextVisual />
                {asFormattedMediaTimecodeString(convertMillisecondsToSeconds(outPointMilliseconds))}
            </Box>
        );
    }

    return <Typography>{JSON.stringify(context)}</Typography>;
};
