import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
} from '@mui/icons-material/';
import { Box, Grid, IconButton, Stack, Typography, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { KeyboardKey, useKeyDown } from './use-key-down';

export enum AudioMIMEType {
    mp3 = 'audio/mpeg',
    audioMp4 = 'audio/mp4',
    audioOgg = 'audio/ogg',
    // TODO change this to audio/wav. This requires a migration
    wav = 'audio/x-wav',
    audioWebm = 'audio/webm',
}

const isAudioMIMEType = (input: unknown): input is AudioMIMEType =>
    Object.values(AudioMIMEType).some((value) => value === (input as AudioMIMEType));

const isValidTimeRangeSelection = (timeRangeSelection: TimeRangeSelection, duration: number) => {
    const { inPointMilliseconds, outPointMilliseconds } = timeRangeSelection;

    if (outPointMilliseconds >= duration) return false;

    return outPointMilliseconds > inPointMilliseconds;
};

export type TimeRangeSelection = {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
};

type TimeRangeSelectionBar = 'inPointSelected' | 'fullSelection';

type UXState = {
    timeRangeSelectionBar: TimeRangeSelectionBar | null;
};

const isBarVisible = (stateBar: TimeRangeSelectionBar, { timeRangeSelectionBar }: UXState) =>
    timeRangeSelectionBar === stateBar;

interface AudioAnnotatorProps {
    audioUrl: string;
    mimeType?: AudioMIMEType;
    onTimeRangeSelected: (timeRangeSelected: TimeRangeSelection | null) => void;
}

const StyledAudioPlayer = styled('audio')`
    border-radius: 20px;
`;

export const AudioAnnotator = ({
    audioUrl,
    mimeType,
    onTimeRangeSelected,
}: AudioAnnotatorProps) => {
    const [uxState, setUxState] = useState<UXState>({
        timeRangeSelectionBar: null,
    });

    const audioRef = useRef<HTMLVideoElement>(null);

    const [isPlayHeadMoved, setIsPlayHeadMoved] = useState<boolean>(false);

    const [inPointMilliseconds, setInPointMilliseconds] = useState<number | null>(null);

    const [outPointMilliseconds, setOutPointMilliseconds] = useState<number | null>(null);

    const [errorMessage, setErrorMessage] = useState<string>('');

    const onTimeUpdate = () => {
        const currentTime = audioRef.current!.currentTime;

        if (currentTime > 0) {
            setIsPlayHeadMoved(true);
        }
    };

    const markInPoint = () => {
        setErrorMessage('');

        console.log({ inpoint: audioRef.current!.currentTime });

        setInPointMilliseconds(audioRef.current!.currentTime);

        toggleTimeRangeSelectionBars('inPointSelected');
    };

    const markOutPoint = () => {
        setErrorMessage('');

        console.log({ outpoint: audioRef.current!.currentTime });

        const timeRangeSelection = {
            inPointMilliseconds: inPointMilliseconds as number,
            outPointMilliseconds: audioRef.current!.currentTime as number,
        };

        const duration = audioRef.current!.duration;

        if (!isValidTimeRangeSelection(timeRangeSelection, duration)) {
            setErrorMessage('Out point cannot come before the in point');

            return;
        }

        setOutPointMilliseconds(audioRef.current!.currentTime);

        toggleTimeRangeSelectionBars('fullSelection');

        onTimeRangeSelected(timeRangeSelection);
    };

    const clearMarkers = () => {
        setInPointMilliseconds(null);

        setOutPointMilliseconds(null);

        onTimeRangeSelected(null);

        setErrorMessage('');
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

    useEffect(() => {
        console.log({ uxState });
    }, [uxState]);

    const toggleTimeRangeSelectionBars = (timeRangeSelectionBar: TimeRangeSelectionBar) => {
        const isVisible = isBarVisible(timeRangeSelectionBar, uxState);

        if (isVisible) {
            setUxState({ timeRangeSelectionBar: null });
        } else {
            setUxState({ timeRangeSelectionBar: timeRangeSelectionBar });
        }
    };

    return (
        <Stack>
            <StyledAudioPlayer ref={audioRef} onTimeUpdate={onTimeUpdate} controls>
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
                    disabled={!isPlayHeadMoved}
                >
                    <ArrowRightIcon />
                </IconButton>
                <IconButton
                    data-testid="out-point-marker-button"
                    onClick={markOutPoint}
                    disabled={inPointMilliseconds === null}
                >
                    <ArrowLeftIcon />
                </IconButton>
                <IconButton
                    data-testid="clear-selected-time-range-button"
                    onClick={clearMarkers}
                    disabled={inPointMilliseconds === null}
                >
                    <ClearIcon />
                </IconButton>
            </Box>
            <Box mt={1}>
                <Grid container spacing={1}>
                    <Grid item xs={3}>
                        <Typography variant="body1" fontWeight="bold">
                            Inpoint: {inPointMilliseconds}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Box
                            data-testid="selection-bar-inpoint"
                            sx={{
                                height: '20px',
                                width: '100%',
                                backgroundColor: '#75ecff',
                                backgroundImage: 'linear-gradient(to right, #75ecff, #fff)',
                                borderLeft: '1px solid #0671ff',
                                borderRadius: '4px',
                                visibility: isBarVisible('inPointSelected', uxState)
                                    ? 'visible'
                                    : 'hidden',
                                position: 'absolute',
                            }}
                        >
                            &nbsp;
                        </Box>
                        <Box
                            data-testid="selection-bar-full"
                            sx={{
                                height: '20px',
                                width: '100%',
                                backgroundColor: '#75ecff',
                                borderRight: '1px solid #0671ff',
                                borderLeft: '1px solid #0671ff',
                                borderRadius: '4px',
                                visibility: isBarVisible('fullSelection', uxState)
                                    ? 'visible'
                                    : 'hidden',
                                position: 'absolute',
                            }}
                        >
                            &nbsp;
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography variant="body1" fontWeight="bold">
                            Outpoint: {outPointMilliseconds}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Stack>
    );
};
