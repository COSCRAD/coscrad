import {
    GeometricFeatureType,
    IMultilingualText,
    ISpatialFeatureProperties,
    ResourceType,
} from '@coscrad/api-interfaces';
import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { Ctor } from '../../../../lib/types/Ctor';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { ViewModelId } from '../../../../queries/buildViewModelForResource/viewModels';
import { SpatialFeatureViewModel } from '../../../../queries/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { Aggregate } from '../../aggregate.entity';
import { ISpatialFeature } from '../interfaces/spatial-feature.interface';

type PointTuple = [number, number];

type GeometryViewModel = {
    type: GeometricFeatureType;
    coordinates: PointTuple | PointTuple[] | PointTuple[][];
};

@CoscradDataExample<EventSourcedSpatialFeatureViewModel>({
    example: {
        type: ResourceType.spatialFeature,
        id: buildDummyUuid(4),
        name: buildMultilingualTextWithSingleItem('test point name'),
        geometry: {
            type: GeometricFeatureType.point,
            coordinates: [-123, 52],
        },
        properties: {
            name: 'the point',
            description: 'is pointing',
        },
    },
})
export class EventSourcedSpatialFeatureViewModel {
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

    // TODO static fromPointCreated

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
            coordinates: geometry.coordinates,
        };

        return new SpatialFeatureViewModel({
            id,
            // TODO make this full ML Text
            name: buildMultilingualTextWithSingleItem(properties.name),
            type,
            properties,
            geometry: geometryView,
        });
    }
}
