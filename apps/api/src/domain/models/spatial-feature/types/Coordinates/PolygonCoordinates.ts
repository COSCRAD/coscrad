import { LinearRing } from './LinearRing';

/**
 * See the [GEO JSON specification](https://datatracker.ietf.org/doc/html/rfc7946#appendix-A.3)
 *
 * Note that the first element is the exterior, and subsequent elements represent
 * holes. We should validate this geometry in the validation layer. But for now,
 * we should disallow holes until we need one.
 */
export type PolygonCoordinates = LinearRing[];
