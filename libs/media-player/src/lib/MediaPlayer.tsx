import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useEffect, useState } from 'react';
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
            console.log('Audio not ready');
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
                    <PlayCircleFilledIcon
                        className={styles['media-controls']}
                        onClick={() => safePlay()}
                    >
                        Play
                    </PlayCircleFilledIcon>
                    <PauseCircleFilledIcon
                        className={styles['media-controls']}
                        onClick={() => audio.pause()}
                    >
                        Pause
                    </PauseCircleFilledIcon>
                </>
            )}
        </div>
    );
}
