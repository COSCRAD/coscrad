import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../types/ResourceType';
import { Resource } from '../resource.entity';
import { IGeometricFeature } from './GeometricFeature';
import { ISpatialFeature } from './ISpatialFeature';
import { LineCoordinates } from './types/Coordinates/LineCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';
import validateAllCoordinatesInLinearStructure from './validation/validateAllCoordinatesInLinearStructure';

@RegisterIndexScopedCommands([])
export class Line extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.line, LineCoordinates>;

    constructor(dto: DTO<Line>) {
        super({ ...dto, type: ResourceType.spatialFeature });

        if (!dto) return;

        const { geometry: geometryDTO } = dto;

        /**
         * Do we want a class instead of a type for this property? Either way,
         * this should already have been validated at this point.
         */
        this.geometry = geometryDTO as IGeometricFeature<
            typeof GeometricFeatureType.line,
            LineCoordinates
        >;
    }

    protected validateComplexInvariants(): InternalError[] {
        const { coordinates } = this.geometry;

        return validateAllCoordinatesInLinearStructure(coordinates);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
