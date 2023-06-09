import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled } from '@mui/material';
import { useRef, useState } from 'react';

interface IPlayPauseButtonProps {
    isDisabled: boolean;
    onButtonClick: () => void;
}

export interface IPlayPauseButton {
    (props: IPlayPauseButtonProps): JSX.Element;
}

export interface AudioClipPlayerProps {
    audioUrl: string;
    listenMessage?: string;
    PlayPauseButton?: IPlayPauseButton;
}

export function AudioClipPlayer({ audioUrl, PlayPauseButton }: AudioClipPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [canPlay, setCanPlay] = useState(false);

    const handleMediaPlayerIconClick = () => {
        new Audio(audioUrl).play();
    };

    const handleAudioLoad = () => {
        setCanPlay(true);
    };

    const StyledMediaPlayer = isNullOrUndefined(PlayPauseButton)
        ? styled('audio')``
        : styled('audio')`
              display: none;
          `;

    return (
        <Box data-testid="audio-clip-player">
            <StyledMediaPlayer controls ref={audioRef} onCanPlay={handleAudioLoad}>
                <source src={audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
            </StyledMediaPlayer>

            {isNullOrUndefined(PlayPauseButton) ? null : (
                <PlayPauseButton
                    isDisabled={!canPlay}
                    key={audioUrl}
                    onButtonClick={handleMediaPlayerIconClick}
                />
            )}
        </Box>
    );
}
