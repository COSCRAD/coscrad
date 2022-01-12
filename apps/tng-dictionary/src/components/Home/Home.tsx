import Toolbar from '../Toolbar/Toolbar';
import './Home.module.css';
import { Link } from "react-router-dom";

/* eslint-disable-next-line */
export interface HomeProps { }

export function Home(props: HomeProps) {
  return (
    <div>
      <Toolbar />
      <div className='home'>
        <div style={{ display: 'grid' }}>
          <Link to="/terms">Terms</Link>
          <Link to="/VocabularyLists">Paradigms and Vocabulary Lists</Link>
          <Link to="/credits">Credits</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
