import { MultiPolygon2D } from '../types';
import { LineTextPresenter } from './line-text-presenter';

interface PolygonPresenterProps {
    coordinates: MultiPolygon2D;
}

export const PolygonTextPresenter = ({ coordinates }: PolygonPresenterProps): JSX.Element => (
    <div>
        {coordinates.map((ring, index) => (
            <div key={index}>
                Polygon {index + 1}/{coordinates.length}
                <br />
                <LineTextPresenter coordinates={ring} />
            </div>
        ))}
    </div>
);
