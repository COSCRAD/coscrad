import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useState } from 'react';

interface IPlayButtonProps {
    isDisabled: boolean;
    onButtonClick: () => void;
}

export interface IPlayButton {
    (props: IPlayButtonProps): JSX.Element;
}

export interface AudioClipPlayerProps {
    audioUrl: string;
    PlayButton?: IPlayButton;
}

export function AudioClipPlayer({ audioUrl, PlayButton }: AudioClipPlayerProps) {
    const [canPlay, setCanPlay] = useState(false);

    const handleMediaPlayerIconClick = () => {
        new Audio(audioUrl).play().catch(console.log);
    };

    const handleAudioLoad = () => {
        setCanPlay(true);
    };

    return (
        <Box data-testid="audio-clip-player">
            <audio src={audioUrl} onCanPlay={handleAudioLoad} />

            {isNullOrUndefined(PlayButton) ? (
                <audio src={audioUrl} controls onCanPlay={handleAudioLoad} />
            ) : (
                <PlayButton
                    isDisabled={!canPlay}
                    key={audioUrl}
                    onButtonClick={handleMediaPlayerIconClick}
                />
            )}
        </Box>
    );
}
