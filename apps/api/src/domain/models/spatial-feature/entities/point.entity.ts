import { NestedDataType } from '../../../../../../../libs/data-types/src';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { ISpatialFeature } from '../interfaces/spatial-feature.interface';
import validatePosition2D from '../validation/validatePosition2D';
import { PointGeometricFeature } from './point-geometric-feature.entity';

@RegisterIndexScopedCommands([])
export class Point extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    @NestedDataType(PointGeometricFeature)
    readonly geometry: PointGeometricFeature;

    constructor(dto: DTO<Point>) {
        super({ ...dto, type: ResourceType.spatialFeature });

        if (!dto) return;

        const { geometry: geometryDTO } = dto;

        /**
         * Do we want a class instead of a type for this property? Either way,
         * this should already have been validated at this point.
         */
        this.geometry = new PointGeometricFeature(geometryDTO);
    }

    protected validateComplexInvariants(): InternalError[] {
        const { coordinates } = this.geometry;

        return validatePosition2D(coordinates);
    }

    // Should we have a base class? Does this logic vary amongst subtypes?
    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
