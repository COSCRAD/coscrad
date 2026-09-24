import { Line2D } from '../types';
import { PointTextPresenter } from './point-text-presenter';

interface LinePresenterProps {
    coordinates: Line2D;
}

export const LineTextPresenter = ({ coordinates }: LinePresenterProps): JSX.Element => (
    <div>
        {coordinates.map((point, index) => (
            <div key={index}>
                Point {index + 1}/{coordinates.length}
                <br />
                <PointTextPresenter coordinates={point} />
            </div>
        ))}
    </div>
);
