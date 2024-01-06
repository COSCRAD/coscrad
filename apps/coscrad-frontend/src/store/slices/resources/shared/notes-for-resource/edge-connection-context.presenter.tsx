import { IEdgeConnectionContext } from '@coscrad/api-interfaces';
import { asFormattedMediaTimecodeString } from '@coscrad/media-player';
import { Box, Typography } from '@mui/material';
import { TimeRange } from '../../../../../components/resources/audio-item/audio-item-detail.full-view.presenter';
import { convertMillisecondsToSeconds } from '../../../../../components/resources/utils/math';
import { EdgeConnectionContextType } from './edge-connection-context-type.enum';

const upperCaseFirstLetter = (str: string) => {
    return str
        .split(' ')
        .map((word) => [word.charAt(0).toUpperCase(), word.slice(1)].join(''))
        .join(' ');
};

type TimeRangeContext = {
    type: EdgeConnectionContextType.timeRange;
    timeRange: TimeRange;
};

interface EdgeConnectionContextPresenterProps {
    context: IEdgeConnectionContext;
}

export const EdgeConnectionContextPresenter = ({
    context,
}: EdgeConnectionContextPresenterProps): JSX.Element => {
    const { type } = context;

    if (type === EdgeConnectionContextType.timeRange) {
        const {
            timeRange: { inPointMilliseconds, outPointMilliseconds },
        } = context as TimeRangeContext;

        return (
            <Box>
                <Typography component="span" variant="body1">
                    <strong>Time Range:</strong>&nbsp;
                    {asFormattedMediaTimecodeString(
                        convertMillisecondsToSeconds(inPointMilliseconds)
                    )}{' '}
                    &lt;----&gt;{' '}
                    {asFormattedMediaTimecodeString(
                        convertMillisecondsToSeconds(outPointMilliseconds)
                    )}
                </Typography>
            </Box>
        );
    } else {
        return <Typography>{JSON.stringify(context)}</Typography>;
    }
};
