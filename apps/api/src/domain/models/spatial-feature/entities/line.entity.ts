import { NestedDataType } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { ISpatialFeature } from '../interfaces/spatial-feature.interface';
import validateAllCoordinatesInLinearStructure from '../validation/validateAllCoordinatesInLinearStructure';
import { LineGeometricFeature } from './line-geometric-feature.entity';

@RegisterIndexScopedCommands([])
export class Line extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    @NestedDataType(LineGeometricFeature)
    readonly geometry: LineGeometricFeature;

    constructor(dto: DTO<Line>) {
        super({ ...dto, type: ResourceType.spatialFeature });

        if (!dto) return;

        const { geometry: geometryDTO } = dto;

        this.geometry = new LineGeometricFeature(geometryDTO);
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
