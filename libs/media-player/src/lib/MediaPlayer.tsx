import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';

export interface MediaPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

export function MediaPlayer({ audioUrl }: MediaPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (audioRef.current !== null) {
            audioRef.current.src = audioUrl;
        }
    }, [audioUrl]);

    return (
        <Box>
            <audio ref={audioRef} controls data-testid="audio-player"></audio>
        </Box>
    );
}
