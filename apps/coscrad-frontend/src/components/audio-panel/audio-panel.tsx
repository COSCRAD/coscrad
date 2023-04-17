import { MediaPlayer } from '@coscrad/media-player';

interface AudioPanelProps {
    url: string;
}
export const AudioPanel = ({ url }: AudioPanelProps): JSX.Element => (
    <>
        Audio panel url: {url}
        <MediaPlayer audioUrl={url} />
    </>
);
