import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Button } from '@mui/material';
import { MouseEventHandler, useEffect, useState } from 'react';
import styles from './MediaPlayer.module.scss';

const useAudio = (audioUrl: string): [boolean, MouseEventHandler<HTMLButtonElement>] => {
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

export interface MediaPlayerProps {
    audioUrl: string;
}

export function MediaPlayer({ audioUrl }: MediaPlayerProps) {
    const [playing, toggle] = useAudio(audioUrl);

    return (
        <div className={styles['container']}>
            <Button id={styles['radioButton']} variant="contained" onClick={toggle}>
                {playing ? <div>Now Playing!</div> : <div>Listen Live!</div>}
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
