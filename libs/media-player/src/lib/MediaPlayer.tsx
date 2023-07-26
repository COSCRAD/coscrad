import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useEffect, useState } from 'react';
import styles from './MediaPlayer.module.scss';

export interface MediaPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

const DEFAULT_LISTEN_MESSAGE = 'Listen Live!';

/**
 * TODO We abandoned this previously. We should rename this `AudioPlayer` and
 * rename the file `audio-player.tsx` and re-implement the basic audio player
 * with controls. Until this is done, we will use the audio clip player even in
 * places where controls would be preferred.
 */
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
    }, [audioUrl]);

    return (
        // <span data-testid={`audio-for-${audioUrl}`}>
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
