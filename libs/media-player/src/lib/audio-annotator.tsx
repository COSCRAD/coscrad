import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
} from '@mui/icons-material/';
import { Box, IconButton, Paper, Stack, Tooltip, Typography, styled } from '@mui/material';
import { RefObject, SyntheticEvent, useEffect, useState } from 'react';
import { asFormattedMediaTimecodeString } from './shared/as-formatted-media-timecode-string';
import { AudioMIMEType } from './shared/audio-mime-type.enum';
import { isAudioMIMEType } from './shared/is-audio-mime-type';
import { KeyboardKey, useKeyDown } from './shared/use-key-down';
import { isNull, isNullOrUndefined } from './shared/validation';
import {
    TimeRangeSelectionStatus,
    TimeRangeSelectionStatusIndicator,
} from './time-range-selection-visual';
import { Timeline, TimelineTrack } from './timeline';

export type Nullable<T> = T | null;

export type MediaPlayDirection = 'forward' | 'reverse';

export enum KeyboardShortcuts {
    play = KeyboardKey.spacebar,
    clear = KeyboardKey.c,
    markInPoint = KeyboardKey.i,
    markOutPoint = KeyboardKey.o,
    scrubForward = KeyboardKey.k,
    scrubBackward = KeyboardKey.j,
}

const StyledAudioElement = styled('audio')`
    border-radius: 20px;
`;

const AudioAnnotatorBox = styled(Paper)({
    padding: '7px',
    borderRadius: '20px',
    marginBottom: '1em',
});

const calculateTimeRangeSelectionStatus = (
    inPointSeconds: number | null,
    outPointSeconds: number | null
): TimeRangeSelectionStatus => {
    if (isNull(inPointSeconds)) return `noSelection`;

    if (isNull(outPointSeconds)) return `inPointOnly`;

    return `fullSelection`;
};

export type TimeRangeSelection = {
    inPointSeconds: number;
    outPointSeconds: number;
};

interface AudioAnnotatorProps {
    audioUrl: string;
    mimeType?: AudioMIMEType;
    selectedTimeRange: Nullable<TimeRangeSelection>;
    onTimeRangeSelected: (timeRangeSelected: Nullable<TimeRangeSelection>) => void;
    /**
     * This gives us an escape hatch from the React rerendering cycle and more
     * freedom to syncronize state between the audio element and ad-hoc command
     * forms.
     */
    timelineTracks: TimelineTrack[];
    audioRef: RefObject<HTMLAudioElement>;
    mediaCurrentTimeFromContext: number;
}

export const AudioAnnotator = ({
    audioUrl,
    mimeType,
    selectedTimeRange,
    onTimeRangeSelected,
    timelineTracks,
    audioRef,
    mediaCurrentTimeFromContext,
}: AudioAnnotatorProps) => {
    // This is a bit awkward, but it works
    const {
        inPointSeconds: defaultInPointSeconds = null,
        outPointSeconds: defaultOutPointSeconds = null,
    } = selectedTimeRange || { inPointSeconds: null, outPointSeconds: null };

    const [inPointSeconds, setInPointSeconds] = useState<Nullable<number>>(defaultInPointSeconds);

    const [outPointSeconds, setOutPointSeconds] =
        useState<Nullable<number>>(defaultOutPointSeconds);

    const [currentTime, setCurrentTime] = useState<number | null>(null);

    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const [durationSeconds, setDurationSeconds] = useState<number | null>(null);

    const [isPlayable, setIsPlayable] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string>('');

    const timeRangeSelectionStatus = calculateTimeRangeSelectionStatus(
        inPointSeconds,
        outPointSeconds
    );

    useEffect(() => {
        if (isNull(mediaCurrentTimeFromContext)) return;

        if (isNullOrUndefined(audioRef.current)) return;

        // Return playhead to the endpoint of the last time range after it's submitted
        audioRef.current.currentTime = mediaCurrentTimeFromContext;
    }, [audioRef, mediaCurrentTimeFromContext]);

    useEffect(() => {
        if (selectedTimeRange === null) {
            setInPointSeconds(null);

            setOutPointSeconds(null);
        }
    }, [selectedTimeRange]);

    useEffect(() => {
        if (isNullOrUndefined(inPointSeconds)) {
            setErrorMessage('');

            onTimeRangeSelected(null);

            return;
        }

        if (isNullOrUndefined(outPointSeconds)) return;

        if (outPointSeconds <= inPointSeconds) {
            setErrorMessage('Out-point can not be equal to, or come before the in-point');

            setOutPointSeconds(null);

            return;
        }

        const selectedTimeRange: TimeRangeSelection = {
            inPointSeconds: inPointSeconds as number,
            outPointSeconds: outPointSeconds as number,
        };

        onTimeRangeSelected(selectedTimeRange);
    }, [inPointSeconds, outPointSeconds, onTimeRangeSelected, setErrorMessage, setOutPointSeconds]);

    const onLoadedData = (event: SyntheticEvent<HTMLAudioElement, Event>) => {
        const audioTarget = event.target as HTMLAudioElement;

        const { duration } = audioTarget;

        setDurationSeconds(duration);
    };

    const onCanPlayThrough = () => {
        // console.log('canplaythrough');

        if (isNullOrUndefined(audioRef.current)) return;

        if (durationSeconds === 0 || isNull(durationSeconds)) {
            const audioTarget = audioRef.current;

            const { duration } = audioTarget;

            setDurationSeconds(duration);
        }
    };

    /**
     * NOTE: This is a HACK to keep focus off the Audio Player to make sure
     * keyboard shortcuts are enabled for the `document`
     */
    const blurAudioPlayer = () => {
        const audioPlayer = audioRef?.current;

        if (isNullOrUndefined(audioPlayer)) return;

        audioPlayer.blur();
    };

    // TODO: test with a longer audio file
    const onCanplay = () => {
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

    const onPlaying = () => {
        console.log('onPlaying');
        if (!isPlaying) {
            setIsPlaying(true);
        }
    };

    const onPause = () => {
        console.log('onPause');
        if (isPlaying) {
            setIsPlaying(false);
        }
    };

    const updateCurrentTime = () => {
        if (!isNullOrUndefined(audioRef.current)) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const seekInMedia = (newTime: number) => {
        if (isNullOrUndefined(audioRef.current)) return;

        audioRef.current.currentTime = newTime;
    };

    const scrub = (increment: number, direction: MediaPlayDirection = 'forward') => {
        const audio = audioRef?.current;

        if (isNullOrUndefined(audio)) return;

        audio.pause();

        const currentTime = audio.currentTime;

        if (direction === 'forward') {
            audio.currentTime = currentTime + increment;
        } else {
            audio.currentTime = currentTime - increment;
        }
    };

    const scrubForward = () => {
        scrub(0.25, 'forward');
    };

    const scrubBackward = () => {
        scrub(0.25, 'reverse');
    };

    const markInPoint = () => {
        const currentTime = audioRef?.current?.currentTime;

        if (isNullOrUndefined(currentTime)) return;

        setInPointSeconds(currentTime);
    };

    const markOutPoint = () => {
        if (isNullOrUndefined(inPointSeconds)) return;

        const currentTime = audioRef?.current?.currentTime;

        if (isNullOrUndefined(currentTime)) return;

        setOutPointSeconds(currentTime);
    };

    const clearMarkers = () => {
        setInPointSeconds(null);

        setOutPointSeconds(null);
    };

    useKeyDown(() => {
        markInPoint();
    }, [KeyboardShortcuts.markInPoint]);

    useKeyDown(() => {
        markOutPoint();
    }, [KeyboardShortcuts.markOutPoint]);

    useKeyDown(() => {
        clearMarkers();
    }, [KeyboardShortcuts.clear]);

    useKeyDown(() => {
        togglePlay();
    }, [KeyboardShortcuts.play]);

    useKeyDown(() => {
        scrubForward();
    }, [KeyboardShortcuts.scrubForward]);

    useKeyDown(() => {
        scrubBackward();
    }, [KeyboardShortcuts.scrubBackward]);

    return (
        <AudioAnnotatorBox>
            <Stack mb={2}>
                <StyledAudioElement
                    ref={audioRef}
                    onLoadedData={onLoadedData}
                    onCanPlay={onCanplay}
                    onCanPlayThrough={onCanPlayThrough}
                    onPlay={blurAudioPlayer}
                    onPlaying={onPlaying}
                    onPause={onPause}
                    onTimeUpdate={updateCurrentTime}
                    onSeeked={blurAudioPlayer}
                    onVolumeChange={blurAudioPlayer}
                    controls
                >
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
                </StyledAudioElement>
                <Box sx={{ height: '12px' }}>
                    <Typography
                        data-testid="audio-error-message"
                        variant="body2"
                        sx={{ color: '#A40011', fontWeight: 'bold', m: 1 }}
                    >
                        {errorMessage !== '' ? (
                            <span>{errorMessage}</span>
                        ) : (
                            <span>
                                Use the Marker Buttons to select a time range for an annotation
                            </span>
                        )}
                    </Typography>
                </Box>
                <Box mt={1}>
                    <Stack>
                        <Box display="inline-flex" alignItems="center" boxSizing="border-box">
                            <Tooltip title="Mark In Point">
                                <span>
                                    <IconButton
                                        data-testid="in-point-marker-button"
                                        onClick={markInPoint}
                                        disabled={!isPlayable}
                                    >
                                        <ArrowRightIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            <Tooltip title="Mark Out Point">
                                <span>
                                    <IconButton
                                        data-testid="out-point-marker-button"
                                        onClick={markOutPoint}
                                        disabled={inPointSeconds === null}
                                    >
                                        <ArrowLeftIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>
                            {!isNullOrUndefined(currentTime) ? (
                                <Box minWidth="60%">
                                    <Typography variant="body1">
                                        Current Time in Seconds: {currentTime}
                                    </Typography>
                                </Box>
                            ) : null}
                        </Box>
                    </Stack>
                    <Stack>
                        <Box display="inline-flex" alignItems="center" width="80%" margin="0 auto">
                            <Box width="70px">
                                {!isNullOrUndefined(inPointSeconds) ? (
                                    <Typography
                                        data-testid="in-point-selection-time-code"
                                        variant="body1"
                                    >
                                        {asFormattedMediaTimecodeString(inPointSeconds)}
                                    </Typography>
                                ) : null}
                            </Box>
                            <Box width="160px" height="20px" padding="0 20px">
                                <TimeRangeSelectionStatusIndicator
                                    timeRangeSelectionStatus={timeRangeSelectionStatus}
                                />
                            </Box>
                            <Box width="70px">
                                {!isNullOrUndefined(outPointSeconds) ? (
                                    <Typography
                                        data-testid="out-point-selection-time-code"
                                        variant="body1"
                                    >
                                        {asFormattedMediaTimecodeString(outPointSeconds)}
                                    </Typography>
                                ) : null}
                            </Box>
                            <Box width="70px">
                                <Tooltip title="Clear Time Range Selection">
                                    <span>
                                        <IconButton
                                            data-testid="clear-selected-time-range-button"
                                            onClick={clearMarkers}
                                            sx={{
                                                visibility:
                                                    inPointSeconds === null ? 'hidden' : 'visible',
                                            }}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                        </Box>
                    </Stack>
                </Box>
                {!isNullOrUndefined(durationSeconds) ? (
                    <Box>
                        <Typography sx={{ mt: 1 }} variant="h5">
                            Annotation Track
                        </Typography>
                        <Box>
                            <Typography variant="h6">
                                Context Time: {mediaCurrentTimeFromContext}
                            </Typography>
                        </Box>
                        <Timeline
                            durationSeconds={durationSeconds}
                            name={`Annotation Track`}
                            timelineTracks={timelineTracks}
                            audioRef={audioRef}
                            isPlaying={isPlaying}
                            seekInMedia={seekInMedia}
                        />
                    </Box>
                ) : null}
            </Stack>
        </AudioAnnotatorBox>
    );
};
