import { SinglePropertyPresenter } from '../../../../utils/generic-components';

interface PointPresenterProps {
    coordinates: [number, number];
}

export const PointPresenter = ({
    coordinates: [latitude, longitude],
}: PointPresenterProps): JSX.Element => (
    <SinglePropertyPresenter display="Coordinates" value={`Lat: ${latitude}, Long: ${longitude}`} />
);
