import './Home.module.css';
import * as React from 'react';
import { Link } from "react-router-dom";
import { Backdrop, Button, Divider } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BackdropUnstyled from '@mui/base/BackdropUnstyled';
import { motion } from 'framer-motion';

/* eslint-disable-next-line */
export interface HomeProps { }

export function Home(props: HomeProps) {
  const [open, setOpen] = React.useState(true);
  const handleClose = () => {
    setOpen(false);
  };
  const handleToggle = () => {
    setOpen(!false);
  };
  const backdrop = <Backdrop
    sx={{ color: '#fff', zIndex: '100', background: 'rgb(168,4,4, .8)' }}
    open={open}
    onClick={handleClose}
  >
    <div style={{ padding: '15px' }}>
      <h1>Disclaimer</h1>
      <Divider sx={{ bgcolor: 'white' }} />
      <p>The 'Tŝilhqot'in Dictionary' is still under active development and this domain is intended for testing purposes by those selected to give user feedback.</p>
      <p>Please do not distribute this app's address.</p>
      <p>Sechanalyagh,</p>
      <br />
      <p><img style={{ marginRight: '10px', verticalAlign: 'text-bottom' }} src='https://www.tsilhqotin.ca/wp-content/uploads/2022/02/imageedit_14_8913908156.png' height={20}></img>Tŝilhqot'in National Government</p>
      <Divider sx={{ bgcolor: 'white' }} />
      <p style={{ textAlign: 'center' }}>'Click anywhere to continue'</p>
    </div>
  </Backdrop>;
  return (

    <div className='homeScreen'>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .6 }}>
        <div className='home'>
          <div className='Center'>
            <Link to="/terms">
              <motion.div
                whileHover={{ scale: 1.05, }}
                whileTap={{ scale: 0.95 }}>
                <Button className='button' style={style} variant="outlined">
                  <SearchIcon className='icon' />Terms
                </Button>
              </motion.div>
            </Link>

            <Link to="/VocabularyLists">
              <motion.div
                whileHover={{ scale: 1.05, }}
                whileTap={{ scale: 0.95 }}>
                <Button className='button' style={style} variant='outlined'>
                  <SearchIcon />Paradigms & Vocabulary Lists
                </Button>
              </motion.div>
            </Link>

            <Link to="/credits">
              <motion.div
                whileHover={{ scale: 1.05, }}
                whileTap={{ scale: 0.95 }}>
                <Button className='button' style={style} variant='outlined'>
                  <InfoOutlinedIcon className='icon' />Credits
                </Button>
              </motion.div>
            </Link>

            <div style={{ display: 'column', marginBlock: '10px' }}>
              <Button style={mobile} variant='outlined'>
                <AndroidIcon />Download for Android
              </Button>
              <Button style={mobile} variant='outlined' >
                <AppleIcon />Download for iOS
              </Button>

            </div>
          </div>
          <div>
          </div>
        </div>
        <div>

          {/* {backdrop} */}
        </div>
      </motion.div>
    </div>

  );
}

export default Home;

const mobile = {
  color: 'white',
  borderColor: 'white',
  borderRadius: '28px',
  textTransform: 'none',
  paddingBlock: '10px',
  margin: '2.5px'
} as const

const style = {
  width: 330,
  borderColor: 'rgb(237,0,0)',
  color: 'rgb(237,0,0)',
  height: 70,
  margin: '5px',
  background: 'white',
  borderRadius: '36px',

}

