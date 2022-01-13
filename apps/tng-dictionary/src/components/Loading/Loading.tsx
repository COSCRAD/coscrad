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
        <CircularProgress style={{ color: 'red' }} size={120} />
      </Box>
    </div>
  );
}

export default Loading;
