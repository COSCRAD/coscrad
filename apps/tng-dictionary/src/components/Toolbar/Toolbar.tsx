import './Toolbar.module.css';
import { CssBaseline } from '@mui/material';
import { AppBar } from '@mui/material';

/* eslint-disable-next-line */
export interface ToolbarProps { }

export function Toolbar(props: ToolbarProps) {
  return (
    <CssBaseline>
      <AppBar
        className="toolbar"
        sx={{ bgcolor: 'red' }}
      >

        <h1>Tŝilhqot'in Dictionary</h1>

      </AppBar>
    </CssBaseline>
  );
}

export default Toolbar;
