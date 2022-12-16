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

export interface IcecastPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

const DEFAULT_LISTEN_MESSAGE = 'Listen Live!';

export function IcecastPlayer({ audioUrl, listenMessage }: IcecastPlayerProps) {
    const [playing, toggle] = useAudio(audioUrl);

    return (
        <div className={styles['container']}>
            <Button id={styles['radioButton']} variant="contained" onClick={toggle}>
                {playing ? (
                    <div>Now Playing!</div>
                ) : (
                    <div>{listenMessage || DEFAULT_LISTEN_MESSAGE}</div>
                )}
                {playing ? (
                    <PauseIcon className={styles['actionButton']} />
                ) : (
                    <PlayArrowIcon className={styles['actionButton']} />
                )}
            </Button>
        </div>
    );
}
