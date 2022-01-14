import './Loading.module.css';
import { CircularProgress } from '@mui/material';
import { Box } from '@mui/material';
import { Skeleton } from '@mui/material';

/* eslint-disable-next-line */
export interface LoadingProps {
  nameToDisplay: string;
}

export function Loading({ nameToDisplay }: LoadingProps) {

  return (
    <div className='loading'>
      {/*<h1>{`Loading ${nameToDisplay}...`}</h1> */}
      <Box sx={{ display: 'flex' }}>
        <CircularProgress style={{ color: 'red' }} size={120}></CircularProgress>
        <div className='Logo'><img height={80} src="https://www.tsilhqotin.ca/wp-content/uploads/2020/11/cropped-tng_logo_resized.png" /></div>
      </Box>
    </div>
  );
}

export default Loading;
