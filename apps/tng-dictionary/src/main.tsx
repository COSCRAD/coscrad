import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Typography } from '@mui/material';

import App from './app/app';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <StrictMode>
        <Typography>
            <App />
        </Typography>
    </StrictMode>
);
