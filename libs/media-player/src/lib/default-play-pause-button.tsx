import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { IconButton } from '@mui/material';
export interface MediaPlayerButtonProps {
    isDisabled: boolean;
    onButtonClick: () => void;
}

export const DefaultPlayButton = ({
    isDisabled,
    onButtonClick,
}: MediaPlayerButtonProps): JSX.Element => (
    <IconButton
        color="secondary"
        data-testid="audio-play-button"
        onClick={onButtonClick}
        disabled={isDisabled}
    >
        <VolumeUpIcon data-testid="play-icon" />
    </IconButton>
);
