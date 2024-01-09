import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
} from '@mui/icons-material/';
import { Box, IconButton, Paper, Stack, Tooltip, Typography, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { asFormattedMediaTimecodeString } from './shared/as-formatted-media-timecode-string';
import { AudioMIMEType } from './shared/audio-mime-type.enum';
import { isAudioMIMEType } from './shared/is-audio-mime-type';
import { KeyboardKey, useKeyDown } from './shared/use-key-down';
import { isNull, isNullOrUndefined } from './shared/validation';
import {
    TimeRangeSelectionStatus,
    TimeRangeSelectionStatusIndicator,
} from './time-range-selection-visual';

type Nullable<T> = T | null;

export type MedidaPlayDirection = 'forward' | 'reverse';

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
    onTimeRangeSelected: (timeRangeSelected: Nullable<TimeRangeSelection>) => void;
}

export const AudioAnnotator = ({
    audioUrl,
    mimeType,
    onTimeRangeSelected,
}: AudioAnnotatorProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [inPointSeconds, setInPointSeconds] = useState<Nullable<number>>(null);

    const [outPointSeconds, setOutPointSeconds] = useState<Nullable<number>>(null);

    const [isPlayable, setIsPlayable] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string>('');

    const timeRangeSelectionStatus = calculateTimeRangeSelectionStatus(
        inPointSeconds,
        outPointSeconds
    );

    /**
     * NOTE: This is a HACK to keep focus off the Audio Player to make sure
     * keyboard shortcuts are enabled for the `document`
     */
    const blurAudioPlayer = () => {
        const audioPlayer = audioRef?.current;

        if (isNullOrUndefined(audioPlayer)) return;

        audioPlayer.blur();
    };

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

    const scrub = (increment: number, direction: MedidaPlayDirection = 'forward') => {
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
        scrub(1, 'forward');
    };

    const scrubBackward = () => {
        scrub(1, 'reverse');
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
            <Stack>
                <StyledAudioElement
                    ref={audioRef}
                    onCanPlay={onCanplay}
                    onPlay={blurAudioPlayer}
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
                    {errorMessage !== '' ? (
                        <Typography
                            data-testid="audio-error-message"
                            variant="body2"
                            sx={{ color: '#A40011', fontWeight: 'bold', m: 1 }}
                        >
                            {errorMessage}
                        </Typography>
                    ) : null}
                </Box>
                <Box mt={1}>
                    <Tooltip title="Mark In Point">
                        <IconButton
                            data-testid="in-point-marker-button"
                            onClick={markInPoint}
                            disabled={!isPlayable}
                        >
                            <ArrowRightIcon />
                        </IconButton>
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
                    <Box display="inline-flex" alignItems="center" mt={1} ml={3}>
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
                </Box>
            </Stack>
        </AudioAnnotatorBox>
    );
};
