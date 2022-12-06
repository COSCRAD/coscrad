import { SinglePropertyPresenter } from '../../../../utils/generic-components';
import { Position2D } from '../types';

interface PointPresenterProps {
    coordinates: Position2D;
}

export const PointTextPresenter = ({
    coordinates: [latitude, longitude],
}: PointPresenterProps): JSX.Element => (
    <SinglePropertyPresenter display="Coordinates" value={`Lat: ${latitude}, Long: ${longitude}`} />
);
