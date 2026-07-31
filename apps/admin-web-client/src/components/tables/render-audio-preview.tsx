import { Button } from '@mui/material';
import AudioPanel from '../shared/audio-panel/audio-panel';

export const renderAudioPreview = (url: string, handleClick: (url: string) => void) => {
    return (
        <Button onClick={() => handleClick(url)}>
            <AudioPanel url={url || ''} />
        </Button>
    );
};
