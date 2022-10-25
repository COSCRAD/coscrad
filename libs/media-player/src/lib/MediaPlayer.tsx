import styles from './MediaPlayer.module.css';

/* eslint-disable-next-line */
export interface MediaPlayerProps {}

export function MediaPlayer(props: MediaPlayerProps) {
    return (
        <div className={styles['container']}>
            <h1>Welcome to MediaPlayer!</h1>
        </div>
    );
}

export default MediaPlayer;
