// Let's trying using a real enum and see if it causes any grief
// the GEOJSON standard specifies that the following values should be capitalized
export enum GeometricFeatureType {
    point = 'Point',
    line = 'LineString',
    polygon = 'Polygon',
}
