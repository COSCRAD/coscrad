import { LineCoordinates } from './LineCoordinates';
import { PointCoordinates } from './PointCoordinates';
import { PolygonCoordinates } from './PolygonCoordinates';

export type GeometricCoordinatesUnion = PointCoordinates | LineCoordinates | PolygonCoordinates;
