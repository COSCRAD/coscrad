import { ISpatialFeatureProperties } from '@coscrad/api-interfaces';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../../types/ResourceType';
import { Resource } from '../../../resource.entity';
import { IGeometricFeature } from '../../interfaces/geometric-feature.interface';
import { ISpatialFeature } from '../../interfaces/spatial-feature.interface';
import { SpatialFeatureProperties } from '../../point/entities/spatial-feature-properties.entity';
import { PolygonCoordinates } from '../../types/Coordinates/PolygonCoordinates';
import { GeometricFeatureType } from '../../types/GeometricFeatureType';

@RegisterIndexScopedCommands([])
export class Polygon extends Resource implements ISpatialFeature {
    readonly type = ResourceType.spatialFeature;

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.polygon, PolygonCoordinates>;

    readonly properties: ISpatialFeatureProperties;

    constructor(dto: DTO<Polygon>) {
        super({ ...dto, type: ResourceType.spatialFeature });

        if (!dto) return;

        const { geometry: geometryDTO, properties: propertiesDTO } = dto;

        /**
         * We use a plain-old object here to minimize maintenance and readability
         * issues that come with additional layers of OOP. Nonetheless, we deep
         * clone to avoid shared references and hence unwanted side-effects.
         */
        this.geometry = cloneToPlainObject(
            geometryDTO as IGeometricFeature<
                typeof GeometricFeatureType.polygon,
                PolygonCoordinates
            >
        );

        this.properties = new SpatialFeatureProperties(propertiesDTO);
    }

    getName(): MultilingualText {
        // TODO Make this multilingual text
        return buildMultilingualTextWithSingleItem(this.properties.name);
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
