import { PointPresenter } from './point-presenter';

interface LinePresenterProps {
    coordinates: [number, number][];
}

export const LinePresenter = ({ coordinates }: LinePresenterProps): JSX.Element => (
    <div>
        {coordinates.map((point, index) => (
            <div key={index}>
                Point {index + 1}/{coordinates.length}
                <br />
                <PointPresenter coordinates={point} />
            </div>
        ))}
    </div>
);
