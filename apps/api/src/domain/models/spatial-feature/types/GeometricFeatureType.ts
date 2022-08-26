import { Line } from '../entities/line.entity';
import { Point } from '../entities/point.entity';
import { Polygon } from '../entities/polygon.entity';

export type GeometricFeatureTypeToSpatialFeatureModel = {
    [GeometricFeatureType.point]: Point;
    [GeometricFeatureType.line]: Line;
    [GeometricFeatureType.polygon]: Polygon;
};

// Let's trying using a real enum and see if it causes any grief
// the GEOJSON standard specifies that the following values should be capitalized
export enum GeometricFeatureType {
    point = 'Point',
    line = 'LineString',
    polygon = 'Polygon',
}
