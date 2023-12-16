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
import { TimeRangeSelectionVisual, TimeRangeVisualState } from './time-range-selection-visual';
import { KeyboardKey, useKeyDown } from './use-key-down';

type Nullable<T> = T | null;

export type MedidaPlayDirection = 'forward' | 'reverse';

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

    const [timeRangeVisualState, setTimeRangeVisualState] = useState<TimeRangeVisualState>(null);

    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (isNullOrUndefined(inPointSeconds)) {
            setErrorMessage('');

            setTimeRangeVisualState(null);

            onTimeRangeSelected(null);

            return;
        }

        if (isNullOrUndefined(outPointSeconds)) {
            setTimeRangeVisualState('inPointSelected');

            return;
        }

        if (outPointSeconds <= inPointSeconds) {
            setErrorMessage('Out-point can not be equal to, or come before the in-point');

            setOutPointSeconds(null);

            return;
        }

        if (outPointSeconds > inPointSeconds) {
            const selectedTimeRange: TimeRangeSelection = {
                inPointSeconds: inPointSeconds,
                outPointSeconds: outPointSeconds,
            };

            console.log({ selectedTimeRange });

            setTimeRangeVisualState('timeRangeSelected');

            onTimeRangeSelected(selectedTimeRange);

            return;
        }
    }, [
        inPointSeconds,
        outPointSeconds,
        onTimeRangeSelected,
        setErrorMessage,
        setTimeRangeVisualState,
        setOutPointSeconds,
    ]);

    // TODO: test with a longer audio file
    const onCanplay = () => {
        console.log('canPlay');

        setIsPlayable(true);
    };

    const togglePlay = () => {
        const audio = audioRef?.current;

        if (isNullOrUndefined(audio)) return;

        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    };

    const scrub = (increment: number, direction: MedidaPlayDirection = 'forward') => {
        const audio = audioRef?.current;

        if (isNullOrUndefined(audio)) return;

        audio.pause();

        const currentTime = audio.currentTime;

        console.log({ currentTime });

        if (direction === 'forward') {
            audio.currentTime = currentTime + increment;
        } else {
            audio.currentTime = currentTime - increment;
        }

        console.log({ after: audio.currentTime });
    };

    const scrubForward = () => {
        scrub(1, 'forward');
    };

    const scrubBackward = () => {
        scrub(1, 'reverse');
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
    };

    const clearMarkers = () => {
        setInPointSeconds(null);

        setOutPointSeconds(null);
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

    useKeyDown(() => {
        togglePlay();
    }, [KeyboardKey.spacebar]);

    useKeyDown(() => {
        scrubForward();
    }, [KeyboardKey.forward]);

    useKeyDown(() => {
        scrubBackward();
    }, [KeyboardKey.reverse]);

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
                    <TimeRangeSelectionVisual timeRangeVisualState={timeRangeVisualState} />
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
