import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../../types/ResourceType';
import { IGeometricFeature } from '../../interfaces/geometric-feature.interface';
import { SpatialFeature } from '../../interfaces/spatial-feature.entity';
import { LineCoordinates } from '../../types/Coordinates/LineCoordinates';
import { GeometricFeatureType } from '../../types/GeometricFeatureType';
import validateAllCoordinatesInLinearStructure from '../../validation/validateAllCoordinatesInLinearStructure';

@RegisterIndexScopedCommands([])
export class Line extends SpatialFeature {
    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.line, LineCoordinates>;

    constructor(dto: DTO<Line>) {
        super({ ...dto, type: ResourceType.spatialFeature });

        if (!dto) return;

        const { geometry: geometryDTO } = dto;

        /**
         * We use a plain-old object here to minimize maintenance and readability
         * issues that come with additional layers of OOP. Nonetheless, we deep
         * clone to avoid shared references and hence unwanted side-effects.
         *
         * Note that we may want to switch to a class now, given our invariant validation
         * approach.
         */
        this.geometry = cloneToPlainObject(
            geometryDTO as IGeometricFeature<typeof GeometricFeatureType.line, LineCoordinates>
        );
    }

    getName(): MultilingualText {
        // TODO Make this multilingual text
        return buildMultilingualTextWithSingleItem(this.properties.name);
    }

    protected validateComplexInvariants(): InternalError[] {
        const { coordinates } = this.geometry;

        /**
         * Note that **all** invariant validation rules are validated within
         * the following function. We opt-out of the decorator-based
         * 'simple-invariant' validation for geometric models because it is
         * more transparent to keep all coordinates as plain-old objects and not
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
