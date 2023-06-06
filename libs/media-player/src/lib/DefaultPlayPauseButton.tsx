import { PauseCircle as PauseCircleIcon, PlayCircle as PlayCircleIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { IPlayPauseButton } from './MediaPlayer';

interface PlayPauseIconProps {
    isPlaying: boolean;
}

export interface MediaPlayerButtonProps extends PlayPauseIconProps {
    isDisabled: boolean;
    onButtonClick: () => void;
}

const PlayPauseIcon = ({ isPlaying }: PlayPauseIconProps) => {
    return isPlaying ? (
        <PauseCircleIcon data-testid="pause-icon" sx={{ fontSize: '40px' }} />
    ) : (
        <PlayCircleIcon data-testid="play-icon" sx={{ fontSize: '40px' }} />
    );
};

export const DefaultPlayPauseButton: IPlayPauseButton = ({
    isPlaying,
    isDisabled,
    onButtonClick,
}: MediaPlayerButtonProps): JSX.Element => (
    <IconButton data-testid="audio-play-button" onClick={onButtonClick} disabled={isDisabled}>
        {PlayPauseIcon({ isPlaying })}
    </IconButton>
);
