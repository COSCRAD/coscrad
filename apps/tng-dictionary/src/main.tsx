import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { Typography } from '@mui/material';

import App from './app/app';

ReactDOM.render(
  <StrictMode>
    <Typography>
      <App />
    </Typography>
  </StrictMode>,
  document.getElementById('root')
);
