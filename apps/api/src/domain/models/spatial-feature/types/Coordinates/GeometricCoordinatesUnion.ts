import { Line2D } from '../../entities/basic-geometry/line-2d.entity';
import { Polygon2D } from '../../entities/basic-geometry/polygon-2d.entity';
import { Position2D } from '../../entities/basic-geometry/position-2d.entity';

export type GeometricCoordinatesUnion = Position2D | Line2D | Polygon2D;
