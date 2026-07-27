import { Button } from '@mui/material';
import AudioPanel from '../../audio-panel/audio-panel';

export const renderAggregateUrlCell = (url: string, handleClick: (url: string) => void) => {
    return (
        <Button onClick={() => handleClick(url)}>
            <AudioPanel url={url || ''} />
        </Button>
    );
};
