import BugReportIcon from '@mui/icons-material/BugReport';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { DefaultPlayButton } from './default-clip-player-button';

const isNullOrUndefined = (input: unknown): input is null | undefined =>
    input === null || typeof input === 'undefined';

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
    isMissingAudioLink = 'isMissingAudioLink',
    null = 'null',
}

export const AudioClipPlayer = ({ audioUrl, UserDefinedPlayButton }: AudioClipPlayerProps) => {
    const [audioState, setAudioState] = useState<AudioState>(AudioState.loading);

    useEffect(() => {
        if (isNullOrUndefined(audioUrl)) {
            setAudioState(AudioState.isMissingAudioLink);
            return;
        }

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
        new Audio(audioUrl).play().catch((err) => console.log(`failed to play audio: ${err}`));
    };

    const PlayButton = isNullOrUndefined(UserDefinedPlayButton)
        ? DefaultPlayButton
        : UserDefinedPlayButton;

    const PlayButtonToUse = PlayButton || DefaultPlayButton;

    if (audioState === AudioState.loading) return <CircularProgress />;

    if (audioState === AudioState.canPlay)
        return (
            <Tooltip title={audioUrl}>
                <span>
                    <PlayButtonToUse key={audioUrl} onButtonClick={handleMediaPlayerIconClick} />
                </span>
            </Tooltip>
        );

    if (audioState === AudioState.isMissingAudioLink)
        return (
            <Box>
                <Tooltip title={typeof audioUrl}>
                    <IconButton color="primary">
                        <LinkOffIcon />
                    </IconButton>
                </Tooltip>
                Audio url is not supported.
            </Box>
        );

    return (
        <Box>
            <Tooltip title={JSON.stringify(audioUrl)}>
                <IconButton color="primary">
                    <BugReportIcon />
                </IconButton>
            </Tooltip>
            Audio url is not supported.
        </Box>
    );
};
