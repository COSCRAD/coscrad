import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
} from '@mui/icons-material/';
import { Box, IconButton, Stack, Typography, styled } from '@mui/material';
import { useRef, useState } from 'react';
import { FormattedMediaTime } from './formatted-currenttime';
import { KeyboardKey, useKeyDown } from './use-key-down';

/**
 * This is a duplicate of the enum in the Audio component, it should live in
 * it's own file
 */
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
    const { inPointSeconds, outPointSeconds } = timeRangeSelection;

    if (outPointSeconds >= duration) return false;

    return outPointSeconds > inPointSeconds;
};

export type TimeRangeSelection = {
    inPointSeconds: number;
    outPointSeconds: number;
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

const TimeRangeSelectionVisual = styled(Box)({
    height: '20px',
    width: '150px',
    backgroundColor: '#75ecff',
    borderRadius: '4px',
    position: 'absolute',
});

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

    const [inPointSeconds, setInPointSeconds] = useState<number | null>(null);

    const [outPointSeconds, setOutPointSeconds] = useState<number | null>(null);

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

        setInPointSeconds(audioRef.current!.currentTime);

        toggleTimeRangeSelectionBars('inPointSelected');
    };

    const markOutPoint = () => {
        setErrorMessage('');

        console.log({ outpoint: audioRef.current!.currentTime });

        const timeRangeSelection = {
            inPointSeconds: inPointSeconds as number,
            outPointSeconds: audioRef.current!.currentTime as number,
        };

        const duration = audioRef.current!.duration;

        if (!isValidTimeRangeSelection(timeRangeSelection, duration)) {
            if (timeRangeSelection.inPointSeconds >= duration) {
                setInPointSeconds(null);

                setOutPointSeconds(null);

                setUxState({ timeRangeSelectionBar: null });

                onTimeRangeSelected(null);

                setErrorMessage(
                    'Not a valid time range.  Marker points cannot be set after play ends'
                );
            } else {
                setErrorMessage('Not a valid time range.  Out point must come after in point');
            }

            return;
        }

        setOutPointSeconds(audioRef.current!.currentTime);

        toggleTimeRangeSelectionBars('fullSelection');

        onTimeRangeSelected(timeRangeSelection);
    };

    const clearMarkers = () => {
        setInPointSeconds(null);

        setOutPointSeconds(null);

        setUxState({ timeRangeSelectionBar: null });

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

    const toggleTimeRangeSelectionBars = (timeRangeSelectionBar: TimeRangeSelectionBar) => {
        console.log(`timeRangeSelectionBar: ${timeRangeSelectionBar} uxstate: `, uxState);

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
                    <TimeRangeSelectionVisual
                        data-testid="selection-bar-inpoint"
                        sx={{
                            backgroundImage: 'linear-gradient(to right, #75ecff, #fff)',
                            borderLeft: '1px solid #0671ff',
                            visibility: isBarVisible('inPointSelected', uxState)
                                ? 'visible'
                                : 'hidden',
                        }}
                    >
                        &nbsp;
                    </TimeRangeSelectionVisual>
                    <TimeRangeSelectionVisual
                        data-testid="selection-bar-full"
                        sx={{
                            borderRight: '1px solid #0671ff',
                            borderLeft: '1px solid #0671ff',
                            visibility: isBarVisible('fullSelection', uxState)
                                ? 'visible'
                                : 'hidden',
                        }}
                    >
                        &nbsp;
                    </TimeRangeSelectionVisual>
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
