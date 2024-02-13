import { Box, Tooltip, styled } from '@mui/material';
import {
    convertMillisecondsToSeconds,
    convertMillisecondsToSecondsRounded,
} from '../resources/utils/math';
import { EDITOR_SOUND_BAR_HEIGHT } from './constants';
import { TimeRangeClip, TimeRangeSeconds } from './timeline';

export const StyledTimeRangeClipLabel = styled(Box)({
    width: '100%',
});
export interface TimeRangeClipLabelProps {
    name: string;
    noteText: string;
    tip: string;
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    onClick?: (inPointSeconds: number) => void;
}

export const TimeRangeClipLabel = ({
    name,
    noteText,
    tip,
    inPointMilliseconds,
    onClick,
}: TimeRangeClipLabelProps): JSX.Element => {
    const inPointSeconds = convertMillisecondsToSeconds(inPointMilliseconds);

    return (
        /* Consider using onMouseEnter/onMouseLeave for div popup instead of button */
        <StyledTimeRangeClipLabel>
            <Tooltip title={tip}>
                {/* Do we really need the value param here? the client already has access to this */}
                <Box
                    sx={{
                        height: `${EDITOR_SOUND_BAR_HEIGHT - 4}px`,
                        whiteSpace: 'nowrap',
                        padding: '3px',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                    data-testid={`time-range-clip-label:${name}`}
                    onClick={() => {
                        onClick(inPointSeconds);
                    }}
                >
                    {noteText}
                </Box>
            </Tooltip>
        </StyledTimeRangeClipLabel>
    );
};

export const buildTimeRangeClip = (props: TimeRangeClipLabelProps): TimeRangeClip => {
    const { inPointMilliseconds, outPointMilliseconds } = props;

    const timeRangeSeconds: TimeRangeSeconds = {
        inPointSeconds: convertMillisecondsToSecondsRounded(inPointMilliseconds),
        outPointSeconds: convertMillisecondsToSecondsRounded(outPointMilliseconds),
    };

    return {
        timeRangeSeconds,
        label: TimeRangeClipLabel(props),
    };
};
