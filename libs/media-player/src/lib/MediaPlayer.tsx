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

    /**
     * We are allowing the React component's state to "lead the action" here.
     * Whenever `isPlaying` is update, we initiate play or pause accordingly.
     *
     * Note that technically `play`\`pause` is a false dichotomy when it comes
     * to the native HTML Media Element's state. Most of the complexity is sidestepped
     * by disabling the button until the `canPlayThrough` event has fired, and the
     * rest by the try\catch hack on the call to `Audio.pause()` below.
     */
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play();
            } else {
                try {
                    audioRef.current.pause();
                } catch {
                    /**
                     * Hack alert.
                     *
                     * `Audio.play()` is async, unlike `Audio.pause`.  It's possible
                     * that the call to `Audio.play()` rejects. There is a period
                     * of time where play is pending, during which we should
                     * really disallow clicking the pause button and avoid calling
                     * `Audio.pause(). As a quick hack, we have chosen to simply
                     * ignore the exception that is thrown.
                     *
                     * Note that this was difficult to catch in manual testing,
                     * but caused browser-specific failures in Chrome (but not
                     * Firefox) in the Cypress component test.
                     *
                     * Read more [here](https://developer.chrome.com/blog/play-request-was-interrupted/).
                     */
                }
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
