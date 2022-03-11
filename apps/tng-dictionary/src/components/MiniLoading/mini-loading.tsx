import './mini-loading.module.css';
import { CircularProgress } from '@mui/material';
import { Box } from '@mui/material';

/* eslint-disable-next-line */
export interface MiniLoadingProps { }

export function MiniLoading(props: MiniLoadingProps) {
  return (
    <div className='miniLoading'>
      <div className='loading'>
        <Box>
          <CircularProgress style={styles.loader} thickness={4} size={70} variant="indeterminate" />
          <CircularProgress style={styles.track} thickness={4} size={70} value={100} variant="determinate" />
          <CircularProgress style={styles.background} thickness={22} size={70} value={100} variant="determinate" />
          <div className='Logo'>
            <img height={40} src={'https://api.tsilhqotinlanguage.ca/uploads/tng_log_for_language_hub_2e4ec30f17.png'} />
          </div>
        </Box>
      </div>
    </div>
  );
}

export default MiniLoading;

const styles = {
  loader: {
    color: 'rgb(168,4,4)',
    position: 'absolute',
    zIndex: '100'
  },
  track: {
    color: 'rgb(170, 170, 170)',
    zIndex: '10',
    position: 'absolute'
  },
  background: {
    color: 'white',
    zIndex: '1',

  }
} as const;