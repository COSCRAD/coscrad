import './Toolbar.module.css';
import { CssBaseline } from '@mui/material';
import { AppBar } from '@mui/material';
import { Link } from 'react-router-dom';

/* eslint-disable-next-line */
export interface ToolbarProps { }

export function Toolbar(props: ToolbarProps) {
  return (
    <CssBaseline>
      <AppBar
        className="toolbar"
        sx={{ bgcolor: 'red' }}
      >
        <Link to="/">
          <h1>Tsilhqotin Dictionary</h1>
        </Link>
      </AppBar>
    </CssBaseline>
  );
}

export default Toolbar;
