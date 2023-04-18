import { PlayArrowRounded } from '@mui/icons-material';
import { Button } from '@mui/material';

export const renderAggregateUrlCell = (url: string, handleClick: (url: string) => void) => (
    <Button onClick={() => handleClick(url)}>
        <PlayArrowRounded />
    </Button>
);
