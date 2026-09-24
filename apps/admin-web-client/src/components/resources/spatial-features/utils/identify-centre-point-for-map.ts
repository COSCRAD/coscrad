import { Position2D, SpatialFeatureCoordinatesUnion } from '../types';
import { findFirstPoint } from './find-first-point';

/**
 * This utility function is used to centre the map on a specific spatial feature.
 * We currently just centre the map on the first point in the feature, but
 * we can update this logic to use the feature's geometric centre in the future.
 *
 * Note that we probably want to hide this behind our concrete implementation(s)
 * of `ICoscradMap`.
 */
export const identifyCentrePointForMap = (
    spatialFeature: SpatialFeatureCoordinatesUnion
): Position2D => findFirstPoint(spatialFeature);
