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
    const [isAudioLoaded, setIsAudioLoaded] = useState(false);
    const [audioEnded, setAudioEnded] = useState(false);

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
            <PauseCircleIcon sx={{ fontSize: '40px' }} />
        ) : (
            <PlayCircleIcon sx={{ fontSize: '40px' }} />
        );
    };

    const handleMediaPlayerIconClick = () => {
        setIsPlaying(!isPlaying);
    };

    const handleAudioLoad = () => {
        setIsAudioLoaded(true);
    };
    const handleAudioEnded = () => {
        setIsPlaying(false);
        setAudioEnded(true);
    };

    const StyledMediaPlayer = styled('audio')`
        display: none;
    `;

    return (
        <Box>
            <StyledMediaPlayer
                controls
                ref={audioRef}
                onCanPlay={handleAudioLoad}
                onEnded={handleAudioEnded}
            >
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
            </StyledMediaPlayer>
            <IconButton onClick={handleMediaPlayerIconClick} disabled={!isAudioLoaded}>
                {updateAudioIcon()}
            </IconButton>
        </Box>
    );
}
