import { useEffect, useState } from 'react';
import {
    PauseButton,
    PlayButton,
} from '../../../../apps/coscrad-frontend/src/styled-components/buttons';
import styles from './MediaPlayer.module.scss';

export interface MediaPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

const DEFAULT_LISTEN_MESSAGE = 'Listen Live!';

export function MediaPlayer({ audioUrl, listenMessage }: MediaPlayerProps) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const [canPlayThrough, setCanPlayThrough] = useState(false);

    const safePlay = () => {
        if (!canPlayThrough || !audio) {
            return;
        }

        audio.play();
    };

    //  const toggle: MouseEventHandler<HTMLButtonElement> = (): void => setPlaying(!playing);

    useEffect(() => {
        const audioElement = new Audio();
        audioElement.src = audioUrl;
        audioElement.preload = 'auto';
        audioElement.addEventListener('canplaythrough', () => {
            setCanPlayThrough(true);
        });
        setAudio(audioElement);
    }, []);

    return (
        <div className={styles['container']}>
            {audio && (
                <>
                    <PlayButton onClick={() => safePlay()} />
                    <PauseButton className={styles['media-controls']} onClick={() => audio.pause()}>
                        Pause
                    </PauseButton>
                </>
            )}
        </div>
    );
}
