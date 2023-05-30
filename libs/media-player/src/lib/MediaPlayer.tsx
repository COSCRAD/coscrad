import { styled, useTheme } from '@mui/material';
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

    const {
        palette: {
            secondary: { main },
        },
    } = useTheme();

    const StyledMediaPlayer = styled('audio')`
        & {
            width: 100px !important;
            overflow: clip;
        }

        &::-webkit-media-controls-panel {
            background: #ffffff;
            overflow: clip;
        }

        &::-webkit-media-controls-mute-button,
        &::-webkit-media-controls-volume-slider,
        &::-webkit-media-controls-volume-slider-thumb,
        &::-webkit-media-controls-timeline,
        &::-webkit-media-controls-current-time-display,
        &::-webkit-media-controls-time-remaining-display,
        &::-webkit-media-controls-duration-display,
        &::-webkit-media-controls-fullscreen-button {
            display: none;
        }

        &::-webkit-media-controls-play-button {
            background-color: ${main};
            border-radius: 20px;
            margin: 0 100px 0 0px;
            overflow: clip !important;
        }

        /* FIREFOX */
        @supports (-moz-animation: none) {
            & {
                background: ${main} !important;
                border-radius: 20px;
                width: 60px !important;
            }
        }
    `;

    return (
        <StyledMediaPlayer
            ref={audioRef}
            controls
            controlsList="nodownload noplaybackrate"
            data-testid="audio-player"
        />
    );
}
