import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { IGeometricFeature } from '../interfaces/geometric-feature.interface';
import { ISpatialFeature } from '../interfaces/spatial-feature.interface';
import { LineCoordinates } from '../types/Coordinates/LineCoordinates';
import { GeometricFeatureType } from '../types/GeometricFeatureType';
import validateAllCoordinatesInLinearStructure from '../validation/validateAllCoordinatesInLinearStructure';

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
        this.geometry = cloneToPlainObject(
            geometryDTO as IGeometricFeature<typeof GeometricFeatureType.line, LineCoordinates>
        );
    }

    protected validateComplexInvariants(): InternalError[] {
        const { coordinates } = this.geometry;

        /**
         * Note that **all** invariant validation rules are validated within
         * the following function. We opt-out of the decorator-based
         * 'simple-invariant' validation for geometric models because it is
         * simpler to keep all coordinates as plain-old objects and not
         * instances of nested classes.
         */
        return validateAllCoordinatesInLinearStructure(coordinates);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
