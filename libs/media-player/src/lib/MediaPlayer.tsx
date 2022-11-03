import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button } from '@mui/material';
import { MouseEventHandler, useEffect, useState } from 'react';
import styles from './MediaPlayer.module.scss';

const audioUrl = 'http://datsan.openbroadcaster.pro:8000/datsan';

const useAudio = (): [boolean, MouseEventHandler<HTMLButtonElement>] => {
    const [audio] = useState(new Audio(audioUrl));
    const [playing, setPlaying] = useState(false);

    const toggle: MouseEventHandler<HTMLButtonElement> = (): void => setPlaying(!playing);

    useEffect(() => {
        playing ? audio.play() : audio.pause();
    }, [playing]);

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };
    }, []);

    return [playing, toggle];
};

export function MediaPlayer() {
    const [playing, toggle] = useAudio();
    return (
        <div className={styles['container']}>
            <Button id={styles['radioButton']} variant="contained" onClick={toggle}>
                Listen Live!
                {playing ? (
                    <PauseIcon className={styles['actionButton']} />
                ) : (
                    <PlayArrowIcon className={styles['actionButton']} />
                )}
            </Button>
        </div>
    );
}

export default MediaPlayer;
