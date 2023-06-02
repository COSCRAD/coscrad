import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { Box, IconButton, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export interface MediaPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

export function MediaPlayer({ audioUrl }: MediaPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [canPlay, setCanPlay] = useState(false);
    const [_audioEnded, setAudioEnded] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    const updateAudioIcon = () => {
        return isPlaying ? (
            <PauseCircleIcon data-testid="pause-icon" sx={{ fontSize: '40px' }} />
        ) : (
            <PlayCircleIcon data-testid="play-icon" sx={{ fontSize: '40px' }} />
        );
    };

    const handleMediaPlayerIconClick = () => {
        setIsPlaying(!isPlaying);
    };

    const handleAudioLoad = () => {
        setCanPlay(true);
    };
    const handleAudioEnded = () => {
        setIsPlaying(false);
        setAudioEnded(true);
    };

    const StyledMediaPlayer = styled('audio')`
        display: none;
    `;

    return (
        <Box data-testid="audio-player">
            <StyledMediaPlayer
                controls
                ref={audioRef}
                onCanPlay={handleAudioLoad}
                onEnded={handleAudioEnded}
            >
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
            </StyledMediaPlayer>

            {/* Break the button out in another component*/}
            <IconButton
                data-testid="audio-play-button"
                onClick={handleMediaPlayerIconClick}
                disabled={!canPlay}
            >
                {updateAudioIcon()}
            </IconButton>
        </Box>
    );
}
