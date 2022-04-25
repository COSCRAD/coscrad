import { Position2D } from '../spatial-feature/types/Coordinates/Position2D';

export interface Boundable2D {
    getGeometricBounds: () => [Position2D, Position2D];
}
