import {
    ArrowLeft as ArrowLeftIcon,
    ArrowRight as ArrowRightIcon,
    Clear as ClearIcon,
} from '@mui/icons-material/';
import { Box, IconButton, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { calculatePercentProgress } from './calculate-percent-progress';
import { MediaTimeline } from './media-timeline';
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

interface AudioAnnotatorPrototypeProps {
    audioUrl: string;
    mimeType?: AudioMIMEType;
    onTimeRangeSelected: (timeRangeSelected: TimeRangeSelection | null) => void;
}

export const AudioAnnotatorPrototype = ({
    audioUrl,
    mimeType,
    onTimeRangeSelected,
}: AudioAnnotatorPrototypeProps) => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isPlayed, setIsPlayed] = useState<boolean>(false);

    const [duration, setDuration] = useState<number>(0);

    const [currentTime, setCurrentTime] = useState<number>(0);

    const [playProgress, setPlayProgress] = useState<number>(0);

    const [inPointMilliseconds, setInPointMilliseconds] = useState<number>(0);

    const [outPointMilliseconds, setOutPointMilliseconds] = useState<number>(0);

    const [errorMessage, setErrorMessage] = useState<string>('');

    const onPlaying = () => {
        if (!isPlayed) setIsPlayed(true);
    };

    const handlePlayProgress = () => {
        const audioTarget = audioRef.current!;

        const { currentTime, duration } = audioTarget;

        setCurrentTime(currentTime);

        setDuration(duration);

        const playProgress = calculatePercentProgress(currentTime, duration);

        setPlayProgress(playProgress);
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
        setInPointMilliseconds(0);

        setOutPointMilliseconds(0);

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
            <audio ref={audioRef} onPlay={onPlaying} controls>
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
            </audio>
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
            <MediaTimeline
                mediaDuration={duration}
                playProgress={playProgress}
                selectionStartMilliseconds={inPointMilliseconds}
                selectionEndMilliseconds={outPointMilliseconds}
            />
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
                    disabled={inPointMilliseconds === 0}
                >
                    <ArrowLeftIcon />
                </IconButton>
                <IconButton
                    data-testid="clear-selected-time-range-button"
                    onClick={clearMarkers}
                    disabled={inPointMilliseconds === 0}
                >
                    <ClearIcon />
                </IconButton>
            </Box>
        </>
    );
};
