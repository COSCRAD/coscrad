import './Loading.module.css';
import { CircularProgress } from '@mui/material';
import { Box } from '@mui/material';
import { CSSProperties } from 'react';
import { motion } from 'framer-motion';

/* eslint-disable-next-line */


export interface StylesDictionary {
  [Key: string]: CSSProperties;
}

export function Loading(): JSX.Element {

  return (
    <div className='load' style={background}>

      <div className='loading'>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress style={styles.loader} thickness={4} size={140} variant="indeterminate" />
          <CircularProgress style={styles.track} thickness={4} size={140} value={100} variant="determinate" />
          <CircularProgress style={styles.background} thickness={22} size={140} value={100} variant="determinate" />
          <div className='Logo'>
            <img height={80} src={logo} />
          </div>
        </Box>
      </div>

    </div>
  );
}

const styles = {
  loader: {
    color: 'white'
  },
  track: {
    color: 'rgb(170, 170, 170)',
    zIndex: '-1',
    position: 'absolute'
  },
  background: {
    color: 'rgb(126,30,30)',
    zIndex: '-2',
    position: 'absolute'
  }
} as const;

const background = {
  background: 'inherit'
}

const logo = "https://www.tsilhqotin.ca/wp-content/uploads/2022/02/imageedit_14_8913908156.png"

export default Loading;
