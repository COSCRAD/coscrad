import { findFirstPoint } from './find-first-point';

/**
 * This utility function is used to centre the map on a specific spatial feature.
 * We currently just centre the map on the first point in the feature, but
 * we can update this logic to use the feature's geometric centre in the future.
 */
export const identifyCentrePointForMap = (
    spatialFeature: [number, number] | [number, number][] | [number, number][][]
): [number, number] => findFirstPoint(spatialFeature);
