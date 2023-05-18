import PauseCircleFilledIcon from '@mui/icons-material/PauseCircleFilled';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useEffect, useState } from 'react';
import styles from './MediaPlayer.module.scss';

export interface MediaPlayerProps {
    audioUrl: string;
    listenMessage?: string;
}

export function MediaPlayer({ audioUrl }: MediaPlayerProps) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [canPlayThrough, setCanPlayThrough] = useState(false);

    const safePlay = () => {
        if (!canPlayThrough || !audio) {
            return;
        }

        audio.play();
        setIsPlaying(true);
    };

    const handlePause = () => {
        audio?.pause();
        setIsPlaying(false);
    };

    const handleAudioNotPlaying = () => {
        setIsPlaying(false);
    };

    useEffect(() => {
        const audioElement = new Audio();
        audioElement.src = audioUrl;
        audioElement.preload = 'auto';
        audioElement.addEventListener('canplaythrough', () => {
            setCanPlayThrough(true);
        });
        audioElement.addEventListener('ended', handleAudioNotPlaying);
        setAudio(audioElement);

        return () => {
            audioElement.removeEventListener('ended', handleAudioNotPlaying);
        };
    }, [audioUrl]);

    return (
        <div className={styles['container']}>
            {audio && (
                <>
                    {!isPlaying && (
                        <PlayCircleFilledIcon
                            sx={{
                                cursor: 'pointer',
                            }}
                            color="primary"
                            className={styles['media-controls']}
                            onClick={() => safePlay()}
                        />
                    )}
                    {isPlaying && (
                        <PauseCircleFilledIcon
                            sx={{ cursor: 'pointer' }}
                            color="secondary"
                            className={styles['media-controls']}
                            onClick={() => handlePause()}
                        />
                    )}
                </>
            )}
        </div>
    );
}
