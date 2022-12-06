import { LinePresenter } from './line-presenter';

interface PolygonPresenterProps {
    coordinates: [number, number][][];
}

export const PolygonPresenter = ({ coordinates }: PolygonPresenterProps): JSX.Element => (
    <div>
        {coordinates.map((ring, index) => (
            <div key={index}>
                Polygon {index + 1}/{coordinates.length}
                <br />
                <LinePresenter coordinates={ring} />
            </div>
        ))}
    </div>
);
