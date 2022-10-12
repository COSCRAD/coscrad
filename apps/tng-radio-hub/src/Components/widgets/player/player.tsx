import { Button, createTheme, ThemeProvider } from '@mui/material';
import './player.module.css';

/* eslint-disable-next-line */
export interface PlayerProps {}

export function Player(props: PlayerProps) {
    const audio = new Audio(`${'http://datsan.openbroadcaster.pro:8000/datsan'}`);

    const start = () => {
        audio.play().catch(console.log);
    };
    return (
        <div>
            <ThemeProvider theme={Theme}>
                <Button variant="contained" color="primary" onClick={start}>
                    hey
                </Button>
            </ThemeProvider>
        </div>
    );
}

export default Player;

const Theme = createTheme({
    palette: {
        primary: {
            main: '#f12029',
        },
    },
});
