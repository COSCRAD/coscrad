import { EdgeConnectionContextType, IEdgeConnectionContext } from '@coscrad/api-interfaces';
import { asFormattedMediaTimecodeString } from '@coscrad/media-player';
import { Box, Typography, styled } from '@mui/material';
import { TimeRangeMilliseconds } from '../../../../../components/resources/audio-item/interactive-annotator';
import { convertMillisecondsToSeconds } from '../../../../../components/resources/utils/math';

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

const HiddenData = styled('div')({
    visibility: 'hidden',
    height: 0,
    width: 0,
});

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
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <strong>Time Range:</strong>&nbsp;
                <HiddenData data-testid="self-note-time-range-context">
                    {JSON.stringify({
                        inPointMilliseconds: inPointMilliseconds,
                        outPointMilliseconds: outPointMilliseconds,
                    })}
                </HiddenData>
                {asFormattedMediaTimecodeString(convertMillisecondsToSeconds(inPointMilliseconds))}
                <TimeRangeContextVisual />
                {asFormattedMediaTimecodeString(convertMillisecondsToSeconds(outPointMilliseconds))}
            </Box>
        );
    }

    return <Typography>{JSON.stringify(context)}</Typography>;
};
