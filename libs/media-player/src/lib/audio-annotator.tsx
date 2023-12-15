import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
} from '@mui/icons-material/';
import { Box, IconButton, Stack, Typography, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { FormattedMediaTime } from './formatted-currenttime';
import { AudioMIMEType } from './shared/audio-mime-type.enum';
import { isAudioMIMEType } from './shared/is-audio-mime-type';
import { TimeRangeSelectionVisual } from './time-range-selection-visual';
import { KeyboardKey, useKeyDown } from './use-key-down';

type Nullable<T> = T | null;

const isValidTimeRangeSelection = (timeRangeSelection: TimeRangeSelection, duration: number) => {
    const { inPointSeconds, outPointSeconds } = timeRangeSelection;

    if (outPointSeconds >= duration) return false;

    return outPointSeconds > inPointSeconds;
};

const StyledAudioPlayer = styled('audio')`
    border-radius: 20px;
`;

export type TimeRangeSelection = {
    inPointSeconds: number;
    outPointSeconds: number;
};

interface AudioAnnotatorProps {
    audioUrl: string;
    mimeType?: AudioMIMEType;
    onTimeRangeSelected: (timeRangeSelected: Nullable<TimeRangeSelection>) => void;
}

export const AudioAnnotator = ({
    audioUrl,
    mimeType,
    onTimeRangeSelected,
}: AudioAnnotatorProps) => {
    const audioRef = useRef<HTMLVideoElement>(null);

    const [inPointSeconds, setInPointSeconds] = useState<Nullable<number>>(null);

    /**
     * outPointSeconds could just be tracked in timeRangeSelection rather than
     * here.  Only reason to keep this is for symetry
     */
    const [outPointSeconds, setOutPointSeconds] = useState<Nullable<number>>(null);

    const [isPlayable, setIsPlayable] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (isNullOrUndefined(inPointSeconds) || isNullOrUndefined(outPointSeconds)) return;

        if (outPointSeconds <= inPointSeconds)
            setErrorMessage('Out-point can not be equal to, or come before the in-point');
    }, [inPointSeconds, outPointSeconds]);

    // TODO: test with a longer audio file
    const onCanplay = () => {
        console.log('canPlay');

        setIsPlayable(true);
    };

    const markInPoint = () => {
        const currentTime = audioRef?.current?.currentTime;

        if (isNullOrUndefined(currentTime)) return;

        console.log({ inpoint: currentTime });

        setInPointSeconds(currentTime);
    };

    const markOutPoint = () => {
        if (isNullOrUndefined(inPointSeconds)) return;

        const currentTime = audioRef?.current?.currentTime;

        if (isNullOrUndefined(currentTime)) return;

        console.log({ outpoint: currentTime });

        setOutPointSeconds(currentTime);

        const duration = audioRef?.current?.duration;

        if (isNullOrUndefined(duration)) return;

        const timeRangeSelection = {
            inPointSeconds: inPointSeconds,
            outPointSeconds: currentTime,
        };

        if (!isValidTimeRangeSelection(timeRangeSelection, duration)) {
            onTimeRangeSelected(timeRangeSelection);
        }
    };

    const clearMarkers = () => {
        setInPointSeconds(null);

        setOutPointSeconds(null);

        onTimeRangeSelected(null);
    };

    useKeyDown(() => {
        markInPoint();
    }, [KeyboardKey.inpoint]);

    useKeyDown(() => {
        markOutPoint();
    }, [KeyboardKey.outpoint]);

    useKeyDown(() => {
        clearMarkers();
    }, [KeyboardKey.clear]);

    return (
        <Stack>
            <StyledAudioPlayer ref={audioRef} onCanPlay={onCanplay} controls>
                {isAudioMIMEType(mimeType) ? (
                    <source key={mimeType} src={audioUrl} type={mimeType} />
                ) : (
                    <>
                        {Object.values(AudioMIMEType).map((mimeType) => (
                            <source key={mimeType} src={audioUrl} type={mimeType} />
                        ))}
                    </>
                )}
                Your browser does not support the audio element.
            </StyledAudioPlayer>
            <Box sx={{ height: '12px' }}>
                {errorMessage !== '' ? (
                    <Typography
                        data-testid="audio-error-message"
                        variant="body2"
                        sx={{ color: 'red', fontWeight: 'bold' }}
                    >
                        {errorMessage}
                    </Typography>
                ) : null}
            </Box>
            <Box mt={1}>
                <IconButton
                    data-testid="in-point-marker-button"
                    onClick={markInPoint}
                    disabled={!isPlayable}
                >
                    <ArrowRightIcon />
                </IconButton>
                <IconButton
                    data-testid="out-point-marker-button"
                    onClick={markOutPoint}
                    disabled={inPointSeconds === null}
                >
                    <ArrowLeftIcon />
                </IconButton>
            </Box>
            <Box display="inline-flex" alignItems="center" mt={1}>
                <Box width="70px">
                    {!isNullOrUndefined(inPointSeconds) ? (
                        <Typography variant="body1">
                            <FormattedMediaTime timeInSeconds={inPointSeconds} />
                        </Typography>
                    ) : null}
                </Box>
                <Box width="160px" height="20px" padding="0 20px">
                    <TimeRangeSelectionVisual inPointSeconds={} />
                </Box>
                <Box width="70px">
                    {!isNullOrUndefined(outPointSeconds) ? (
                        <Typography variant="body1">
                            <FormattedMediaTime timeInSeconds={outPointSeconds} />
                        </Typography>
                    ) : null}
                </Box>
                <Box width="70px">
                    <IconButton
                        data-testid="clear-selected-time-range-button"
                        onClick={clearMarkers}
                        sx={{ visibility: inPointSeconds === null ? 'hidden' : 'visible' }}
                    >
                        <ClearIcon />
                    </IconButton>
                </Box>
            </Box>
        </Stack>
    );
};
