import './Toolbar.module.css';
import { CssBaseline } from '@mui/material';
import { AppBar } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';


/* eslint-disable-next-line */
export interface ToolbarProps { }

export function Toolbar(props: ToolbarProps) {
  return (
    <CssBaseline>
      <AppBar className="toolbar">
        {/*<div style={{}}><img src='https://www.tsilhqotin.ca/wp-content/uploads/2022/02/imageedit_14_8913908156.png' height={40}></img></div> */}
        <motion.div
          style={{ lineHeight: '80px' }}
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{ duration: .6 }}
        >
          <Link className='navHeader' to={'/'}>
            <h2>
              <img className='tool' src='https://api.tsilhqotinlanguage.ca/uploads/tng_log_for_language_hub_2e4ec30f17.png' height={40}></img>
              Tŝilhqot’in Dictionary
            </h2>
          </Link>
        </motion.div>
      </AppBar>
    </CssBaseline>
  );
}

export default Toolbar;

