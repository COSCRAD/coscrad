import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { DefaultPlayButton } from './default-clip-player-button';

interface IPlayButtonProps {
    onButtonClick: () => void;
}

export interface IPlayButton {
    (props: IPlayButtonProps): JSX.Element;
}

export interface AudioClipPlayerProps {
    audioUrl: string;
    UserDefinedPlayButton?: IPlayButton;
}

enum AudioState {
    loading = 'loading',
    error = 'error',
    canPlay = 'canPlay',
}

export function AudioClipPlayer({ audioUrl, UserDefinedPlayButton }: AudioClipPlayerProps) {
    const [audioState, setAudioState] = useState<AudioState>(AudioState.loading);

    useEffect(() => {
        const onCanPlay = () => {
            setAudioState(AudioState.canPlay);
        };

        const onError = () => {
            setAudioState(AudioState.error);
        };

        /**
         * This audio instance will never be played. We are using it to test whether
         * the URL is valid.
         */
        const testAudio = new Audio(audioUrl);

        testAudio.addEventListener('canplaythrough', onCanPlay);

        testAudio.addEventListener('error', onError);
    }, [audioUrl]);

    const handleMediaPlayerIconClick = () => {
        console.log(`attempting to play audio`);

        new Audio(audioUrl).play().catch((err) => console.log(`failed to play audio: ${err}`));
    };

    const PlayButton = isNullOrUndefined(UserDefinedPlayButton)
        ? DefaultPlayButton
        : UserDefinedPlayButton;

    if (audioState === AudioState.loading) return <div>Loading</div>;

    if (audioState === AudioState.canPlay)
        return (
            <Box>
                <PlayButton key={audioUrl} onButtonClick={handleMediaPlayerIconClick} />
            </Box>
        );

    return <div>audio not available</div>;
}
