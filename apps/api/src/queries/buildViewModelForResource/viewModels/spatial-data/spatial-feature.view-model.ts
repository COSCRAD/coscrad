import {
    AggregateType,
    GeometricFeatureType,
    IMultilingualText,
    ISpatialFeatureProperties,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { buildMultilingualTextWithSingleItem } from '../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../domain/common/entities/multilingual-text';
import { Aggregate } from '../../../../domain/models/aggregate.entity';

import { ISpatialFeature } from '../../../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import buildDummyUuid from '../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { Ctor } from '../../../../lib/types/Ctor';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { ViewModelId } from '../types/ViewModelId';

type PointTuple = [number, number];

type GeometryViewModel = {
    type: GeometricFeatureType;
    coordinates: PointTuple | PointTuple[] | PointTuple[][];
};

/**
 * We have a single `SpatialFeatureViewModel` and  deal with
 * discriminating the union client-side.
 */
@CoscradDataExample<SpatialFeatureViewModel>({
    example: {
        type: AggregateType.spatialFeature,
        id: buildDummyUuid(6),
        name: {
            items: [],
        },
        geometry: {
            type: GeometricFeatureType.point,
            coordinates: [52, -123],
        },
        properties: {
            name: buildMultilingualTextWithSingleItem('my creek'),
            description: buildMultilingualTextWithSingleItem('a nice little town'),
        },
    },
})
export class SpatialFeatureViewModel implements ISpatialFeatureViewModel {
    readonly type = ResourceType.spatialFeature;

    @ApiProperty({
        example: '12',
        description: 'uniquely identifies an entity from other entities of the same type',
    })
    @FromDomainModel(Aggregate as unknown as Ctor<unknown>)
    readonly id: ViewModelId;

    @NestedDataType(MultilingualText, {
        description: `multilingual text name of the entity`,
        label: `name`,
    })
    readonly name: IMultilingualText;

    /**
     * We may need to make this a class so we can generate the API docs.
     */
    readonly geometry: GeometryViewModel;

    /**
     * This name is in keeping with the GEOJSON standard. It holds all non-geometry
     * properties that are associated with the identity of this spatial feature.
     */
    readonly properties: ISpatialFeatureProperties;

    constructor(viewModelDto: DTO<SpatialFeatureViewModel>) {
        const { geometry, properties, id, name } = viewModelDto;

        this.id = id;

        this.name = new MultilingualText(name);

        this.geometry = cloneToPlainObject(geometry);

        this.properties = cloneToPlainObject(properties);
    }

    static fromDto(dto: DTO<SpatialFeatureViewModel>): SpatialFeatureViewModel {
        return new SpatialFeatureViewModel(dto);
    }

    static fromDomainModel({
        type,
        id,
        geometry,
        properties,
    }: ISpatialFeature): SpatialFeatureViewModel {
        const geometryView: GeometryViewModel = {
            type: geometry.type,
            // `toPlain`? `toGeoJson`?
            coordinates: geometry.coordinates.toTuple(),
        };

        return new SpatialFeatureViewModel({
            id,
            name: properties.name,
            type,
            properties,
            geometry: geometryView,
        });
    }
}
