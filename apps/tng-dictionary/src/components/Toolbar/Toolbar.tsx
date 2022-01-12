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
        <div>
          <h1>Tsilhqotin Dictionary</h1>
        </div>
      </AppBar>
    </CssBaseline>
  );
}

export default Toolbar;
