import { Line2D } from './line-2d';
import { MultiPolygon2D } from './multi-polygon-2d';
import { Position2D } from './position2d';

export type SpatialFeatureCoordinatesUnion = Position2D | Line2D | MultiPolygon2D;
