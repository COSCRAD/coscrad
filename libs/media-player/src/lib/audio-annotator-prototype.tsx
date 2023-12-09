import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
} from '@mui/icons-material/';
import { Box, IconButton, Typography, styled } from '@mui/material';
import { useRef, useState } from 'react';
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

type MediaState = {
    currentTime: number;
    duration: number;
};

export type TimeRangeSelection = {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
};

interface AudioAnnotatorPrototypeProps {
    audioUrl: string;
    mimeType?: AudioMIMEType;
    onTimeRangeSelected: (timeRangeSelected: TimeRangeSelection | null) => void;
}

const StyledAudioPlayer = styled('audio')`
    border-radius: 20px;
`;

export const AudioAnnotatorPrototype = ({
    audioUrl,
    mimeType,
    onTimeRangeSelected,
}: AudioAnnotatorPrototypeProps) => {
    const audioRef = useRef<HTMLVideoElement>(null);

    const [isPlayed, setIsPlayed] = useState<boolean>(false);

    const [inPointMilliseconds, setInPointMilliseconds] = useState<number | null>(null);

    const [outPointMilliseconds, setOutPointMilliseconds] = useState<number | null>(null);

    const [errorMessage, setErrorMessage] = useState<string>('');

    const onPlaying = () => {
        if (!isPlayed) setIsPlayed(true);
    };

    const markInPoint = () => {
        setErrorMessage('');

        console.log({ inpoint: audioRef.current!.currentTime });

        setInPointMilliseconds(audioRef.current!.currentTime);
    };

    const markOutPoint = () => {
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

    return (
        <>
            <StyledAudioPlayer ref={audioRef} onPlaying={onPlaying} controls>
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
            <Box sx={{ mt: 1 }}>
                <IconButton
                    data-testid="in-point-marker-button"
                    onClick={markInPoint}
                    disabled={!isPlayed}
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
        </>
    );
};
