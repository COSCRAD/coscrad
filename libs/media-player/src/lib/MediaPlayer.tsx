import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Box, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';

export interface MediaPlayerProps {
    audioUrl: string;
}

export function MediaPlayer({ audioUrl }: MediaPlayerProps) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const [canPlayThrough, setCanPlayThrough] = useState(false);

    const safePlay = () => {
        if (!canPlayThrough || !audio) {
            return;
        }

        audio.play();
    };

    useEffect(() => {
        const audioElement = new Audio();
        audioElement.src = audioUrl;
        audioElement.preload = 'auto';
        audioElement.addEventListener('canplaythrough', () => {
            setCanPlayThrough(true);
        });
        setAudio(audioElement);
    }, []);

    return (
        <Box>
            {audio && (
                <>
                    <IconButton aria-label="Play Button">
                        <PlayArrowIcon onClick={() => safePlay()} fontSize="large" />
                    </IconButton>
                    <IconButton aria-label="Pause Button">
                        <PauseIcon onClick={() => audio.pause()} fontSize="large" />
                    </IconButton>
                </>
            )}
        </Box>
    );
}
