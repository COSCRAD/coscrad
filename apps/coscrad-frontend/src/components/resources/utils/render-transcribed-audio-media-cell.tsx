import { MediaPlayer } from '@coscrad/media-player';

export const renderTranscribedAudioMediaCell = (url: string): JSX.Element => (
    <div className="transcribed-audio-player" title={url}>
        <MediaPlayer audioUrl={url} />
    </div>
);
