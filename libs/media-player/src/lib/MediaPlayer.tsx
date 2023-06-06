import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

interface IPlayPauseButtonProps {
    isPlaying: boolean;
    isDisabled: boolean;
    onButtonClick: () => void;
}

export interface IPlayPauseButton {
    (props: IPlayPauseButtonProps): JSX.Element;
}

export interface MediaPlayerProps {
    audioUrl: string;
    listenMessage?: string;
    // This is optional. If it's not provided, we render the native audio controls.
    PlayPauseButton?: IPlayPauseButton;
}

export function MediaPlayer({ audioUrl, PlayPauseButton }: MediaPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [canPlay, setCanPlay] = useState(false);

    /**
     * We are allowing the React component's state to "lead the action" here.
     * Whenever `isPlaying` is updated, we initiate play or pause accordingly.
     *
     * Note that technically `playing`\`paused` is a false dichotomy when it comes
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

    const handleMediaPlayerIconClick = () => {
        setIsPlaying(!isPlaying);
    };

    const handleAudioLoad = () => {
        setCanPlay(true);
    };
    const handleAudioEnded = () => {
        setIsPlaying(false);
    };

    // We want to wrap this in only if a PlayPauseButton was provided by the caller
    const StyledMediaPlayer = isNullOrUndefined(PlayPauseButton)
        ? styled('audio')``
        : styled('audio')`
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

            {isNullOrUndefined(PlayPauseButton) ? null : (
                <PlayPauseButton
                    isDisabled={!canPlay}
                    isPlaying={isPlaying}
                    onButtonClick={handleMediaPlayerIconClick}
                />
            )}
        </Box>
    );
}
