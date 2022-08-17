import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../types/ResourceType';
import { Resource } from '../resource.entity';
import { IGeometricFeature } from './GeometricFeature';
import { ISpatialFeature } from './ISpatialFeature';
import { PolygonCoordinates } from './types/Coordinates/PolygonCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';

@RegisterIndexScopedCommands([])
export class Polygon extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.polygon, PolygonCoordinates>;

    constructor(dto: DTO<Polygon>) {
        super({ ...dto, type: ResourceType.spatialFeature });

        if (!dto) return;

        const { geometry: geometryDTO } = dto;

        /**
         * Do we want a class instead of a type for this property? Either way,
         * this should already have been validated at this point.
         */
        this.geometry = geometryDTO as IGeometricFeature<
            typeof GeometricFeatureType.polygon,
            PolygonCoordinates
        >;
    }

    protected validateComplexInvariants(): InternalError[] {
        // TODO validate polygon geometry
        /**
         * Validate the 0th entry- the boundary line ring
         * Do not allow holes at this time
         */
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
