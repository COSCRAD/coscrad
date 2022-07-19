import Player from '../../widgets/player/player';
import './stream.module.css';

/* eslint-disable-next-line */
export interface StreamProps {}

export function Stream(props: StreamProps) {
    return (
      <div className="stream">
      <div className="backDrop">
        <Player />
        <h1>schedule for metal Mondays</h1>
      <img
        height={120}
        src="https://www.tsilhqotin.ca/wp-content/uploads/2022/03/Metal-Mondays.png"
        alt="Metal Mondays"
      />
      </div>
    </div>
    );
}

export default Stream;
