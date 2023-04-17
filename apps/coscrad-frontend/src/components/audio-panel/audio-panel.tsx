import { MediaPlayer } from '@coscrad/media-player';

interface AudioPanelProps {
    url: string;
}
export const AudioPanel = ({ url }: AudioPanelProps): JSX.Element => (
    <div>
        Audio panel
        <MediaPlayer audioUrl={url} />
    </div>
);
