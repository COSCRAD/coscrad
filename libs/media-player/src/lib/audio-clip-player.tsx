import { isNullOrUndefined } from '@coscrad/validation-constraints';
import BugReportIcon from '@mui/icons-material/BugReport';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
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
    undefined = 'undefined',
}

export function AudioClipPlayer({ audioUrl, UserDefinedPlayButton }: AudioClipPlayerProps) {
    const [audioState, setAudioState] = useState<AudioState>(AudioState.loading);
    console.log(audioUrl, 'howdy');

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

        if (!isNullOrUndefined(audioUrl)) {
            const testAudio = new Audio(audioUrl);

            testAudio.addEventListener('error', onError);
        } else {
            setAudioState(AudioState.undefined);
        }
    }, [audioUrl]);

    const handleMediaPlayerIconClick = () => {
        console.log(`attempting to play audio`);

        new Audio(audioUrl).play().catch((err) => console.log(`failed to play audio: ${err}`));
    };

    const PlayButton = isNullOrUndefined(UserDefinedPlayButton)
        ? DefaultPlayButton
        : UserDefinedPlayButton;

    if (audioState === AudioState.loading) return <CircularProgress />;

    if (audioState === AudioState.canPlay)
        return (
            <Tooltip title={audioUrl}>
                <span>
                    <PlayButton key={audioUrl} onButtonClick={handleMediaPlayerIconClick} />
                </span>
            </Tooltip>
        );
    if (audioState === AudioState.undefined)
        return (
            <Box>
                <Tooltip title={typeof audioUrl}>
                    <IconButton color="primary">
                        <LinkOffIcon />
                    </IconButton>
                </Tooltip>
                Audio url is {typeof audioUrl}.
            </Box>
        );

    return (
        <Box>
            <Tooltip title={audioUrl}>
                <IconButton color="primary">
                    <BugReportIcon />
                </IconButton>
            </Tooltip>
            Audio url is not supported.
        </Box>
    );
}
