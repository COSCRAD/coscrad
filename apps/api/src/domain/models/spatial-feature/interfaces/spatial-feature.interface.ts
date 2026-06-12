import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { GeometricFeature } from '../Geometric-Feature';
import { SpatialFeatureProperties } from '../point/entities/spatial-feature-properties.entity';

/**
 * TODO We need to reconsider the purpose of this interface. Typically we only
 * expose properties on interfaces that formalize the contract with the client.
 * The client is unaware of the domain model. If we have domain-centric utilities
 * that depend on this interface, we should expose getters instead of properties
 * and allow each service to declare a minimal role interface.
 */
export interface ISpatialFeature extends Resource {
    type: typeof ResourceType.spatialFeature;

    // TODO Use the type from `@coscrad/api-interfaces` ?
    geometry: GeometricFeature;

    properties: SpatialFeatureProperties;
}
