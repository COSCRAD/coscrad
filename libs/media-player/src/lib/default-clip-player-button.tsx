import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { IconButton } from '@mui/material';

export interface MediaPlayerButtonProps {
    onButtonClick: () => void;
}

export const DefaultPlayButton = ({ onButtonClick }: MediaPlayerButtonProps): JSX.Element => (
    <IconButton data-testid="audio-play-button" color="secondary" onClick={onButtonClick}>
        <VolumeUpIcon data-testid="play-icon" />
    </IconButton>
);
