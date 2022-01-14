import './Home.module.css';
import { Link } from "react-router-dom";
import { Button } from '@mui/material';

/* eslint-disable-next-line */
export interface HomeProps { }

export function Home(props: HomeProps) {
  return (
    <div>
      <div className='home'>
        <div className='Center' style={{ display: 'grid' }}>
          <Link to="/terms"><Button sx={{ width: 310, borderColor: 'red', color: 'red', borderRadius: '20px' }} variant="outlined">Terms</Button></Link>
          <Link to="/VocabularyLists"><Button sx={{ width: 310, mt: 1, borderColor: 'red', color: 'red', borderRadius: '20px' }} variant='outlined'>Paradigms and Vocabulary Lists</Button></Link>
          <Link to="/credits"><Button sx={{ width: 310, mt: 1, borderColor: 'red', color: 'red', borderRadius: '20px' }} variant='outlined'>Credits</Button></Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
