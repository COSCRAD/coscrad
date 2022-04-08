import { PointCoordinates } from './PointCoordinates';

/**
 * See the GEO JSON specification. Note we may want this to be a class, as
 * we will want to validate the following domain invariants are met.
 *
 * From the [GEO JSON spec, section-3.1.6](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6
 *  **** DOMAIN INVARIANTS ****
 *
 *    To specify a constraint specific to Polygons, it is useful to
   introduce the concept of a linear ring:

   o  A linear ring is a closed LineString with four or more positions.

   o  The first and last positions are equivalent, and they MUST contain
      identical values; their representation SHOULD also be identical.

   o  A linear ring is the boundary of a surface or the boundary of a
      hole in a surface.

   o  A linear ring MUST follow the right-hand rule with respect to the
      area it bounds, i.e., exterior rings are counterclockwise, and
      holes are clockwise.

   Note: the [GJ2008] specification did not discuss linear ring winding
   order.  For backwards compatibility, parsers SHOULD NOT reject
   Polygons that do not follow the right-hand rule.

   Though a linear ring is not explicitly represented as a GeoJSON
   geometry type, it leads to a canonical formulation of the Polygon
   geometry type definition as follows:

   o  For type "Polygon", the "coordinates" member MUST be an array of
      linear ring coordinate arrays.

   o  For Polygons with more than one of these rings, the first MUST be
      the exterior ring, and any others MUST be interior rings.  The
      exterior ring bounds the surface, and the interior rings (if
      present) bound holes within the surface.
 */
export type LinearRing = PointCoordinates[];
