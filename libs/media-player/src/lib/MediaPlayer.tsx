import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { Box, IconButton } from '@mui/material';
import { useEffect, useRef } from 'react';

export interface MediaPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

export function MediaPlayer({ audioUrl }: MediaPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const playButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        const AudioContext = window.AudioContext || window.AudioContext;
        const audioContext = new AudioContext();

        const audioElement = audioRef.current;
        const playButton = playButtonRef.current;

        if (audioElement) {
            if (!audioElement.src || audioElement.src !== audioUrl) {
                audioElement.src = audioUrl;
            }

            if (!audioElement) {
                const track = audioContext.createMediaElementSource(audioElement);
                track.connect(audioContext.destination);
            }
        } else {
            console.error('Audio is null');
        }

        if (playButton) {
            playButton.addEventListener('click', () => {
                if (audioContext.state === 'suspended') {
                    audioContext.resume().then(() => {
                        audioElement?.play();
                    });
                } else if (audioContext.state === 'running') {
                    audioElement?.play();
                }
            });
        } else {
            console.error('Play button is null');
        }
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
    }, [audioUrl]);

    return (
        <Box>
            <audio ref={audioRef}></audio>

            <IconButton ref={playButtonRef}>
                <PlayCircleIcon color="secondary" />
            </IconButton>
        </Box>
    );
}
