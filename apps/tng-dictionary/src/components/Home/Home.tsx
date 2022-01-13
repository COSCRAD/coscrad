import Toolbar from '../Toolbar/Toolbar';
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
          <Link to="/terms"><Button sx={{ width: 310 }} variant="outlined">Terms</Button></Link>
          <Link to="/VocabularyLists"><Button sx={{ width: 310, mt: 1 }} variant='outlined'>Paradigms and Vocabulary Lists</Button></Link>
          <Link to="/credits"><Button sx={{ width: 310, mt: 1 }} variant='outlined'>Credits</Button></Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
