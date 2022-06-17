import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { CommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import geometricFeatureValidator from '../../domainModelValidators/spatialFeatureValidator/geometricFeatureValidator';
import { Valid } from '../../domainModelValidators/Valid';
import { ResourceType } from '../../types/ResourceType';
import { Resource } from '../resource.entity';
import { IGeometricFeature } from './GeometricFeature';
import { ISpatialFeature } from './ISpatialFeature';
import { LineCoordinates } from './types/Coordinates/LineCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';

@RegisterIndexScopedCommands([])
export class Line extends Resource implements ISpatialFeature, CommandWriteContext {
    readonly type = ResourceType.spatialFeature;

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.line, LineCoordinates>;

    constructor(dto: DTO<Line>) {
        super({ ...dto, type: ResourceType.spatialFeature });

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

    validateInvariants(): ResultOrError<Valid> {
        // TODO breakout the individual type validators into each class
        return geometricFeatureValidator(this);
    }

    getAvailableCommands(): string[] {
        return [];
    }
}
