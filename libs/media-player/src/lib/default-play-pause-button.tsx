import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { IconButton } from '@mui/material';

// interface PlayPauseIconProps {
//     isPlaying: boolean;
// }

export interface MediaPlayerButtonProps {
    isDisabled: boolean;
    onButtonClick: () => void;
}

const PlayPauseIcon = () => {
    return <VolumeUpIcon data-testid="play-icon" sx={{ fontSize: '40px' }} />;
};

export const DefaultPlayPauseButton = ({
    // isPlaying,
    isDisabled,
    onButtonClick,
}: MediaPlayerButtonProps): JSX.Element => (
    <IconButton data-testid="audio-play-button" onClick={onButtonClick} disabled={isDisabled}>
        {PlayPauseIcon()}
    </IconButton>
);
