import Player from '../../widgets/player/player';
import './home.module.css';

/* eslint-disable-next-line */
export interface HomeProps {}

export function Home(props: HomeProps) {
    return (
        <div className="home">
      <div className="backDrop">
        <Player />
      </div>
    </div>
    );
}

export default Home;
