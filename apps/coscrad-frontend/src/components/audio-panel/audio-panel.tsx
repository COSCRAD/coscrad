import { MediaPlayer } from '@coscrad/media-player';

interface AudioPanelProps {
    url: string;
}

const AudioPanel = ({ url }: AudioPanelProps): JSX.Element => {
    return <MediaPlayer audioUrl={url} />;
};

export default AudioPanel;
