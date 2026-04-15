import {
    GeometricFeatureType,
    IMultilingualText,
    ISpatialFeatureProperties,
    ResourceType,
} from '@coscrad/api-interfaces';
import { BooleanDataType, FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject } from '@coscrad/validation-constraints';
import { ApiProperty } from '@nestjs/swagger';
import { Ctor } from '../../../../lib/types/Ctor';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import {
    ConnectionRecordForResourceViewModel,
    ViewModelId,
} from '../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { SpatialFeatureViewModel } from '../../../../queries/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { Aggregate } from '../../aggregate.entity';
import { ContributionSummary } from '../../user-management';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
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
        isPublished: true,
        name: buildMultilingualTextWithSingleItem('test point name'),
        tags: [],
        notes: {},
        connections: {},
        contributions: [],
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

    @BooleanDataType({
        label: 'is published',
        description: 'indicates whether this resource is available to the public',
    })
    isPublished: boolean;

    @NestedDataType(ContributionSummary, {
        label: 'contributions',
        description: 'a list of all contributions to the development of this resource',
    })
    contributions: ContributionSummary[];

    @NestedDataType(EventSourcedTagViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagViewModel[];

    notes: Record<AggregateId, NoteRecordForResourceViewModel> = {};

    connections: Record<string, ConnectionRecordForResourceViewModel>;

    /**
     * We may need to make this a class so we can generate the API docs.
     */
    readonly geometry: GeometryViewModel;

    /**
     * This name is in keeping with the GEOJSON standard. It holds all non-geometry
     * properties that are associated with the identity of this spatial feature.
     */
    readonly properties: ISpatialFeatureProperties;

    constructor(viewModelDto: DTO<EventSourcedSpatialFeatureViewModel>) {
        const {
            geometry,
            properties,
            id,
            name,
            tags,
            notes,
            connections,
            isPublished,
            contributions,
        } = viewModelDto;

        this.id = id;

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.name = new MultilingualText(name);

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];

        this.notes = isNonEmptyObject(notes) ? cloneToPlainObject(notes) : {};

        this.connections = isNonEmptyObject(connections) ? cloneToPlainObject(connections) : {};

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => ContributionSummary.fromDto(c))
            : [];

        this.geometry = cloneToPlainObject(geometry);

        this.properties = cloneToPlainObject(properties);
    }

    // TODO static fromPointCreated

    static fromDto(
        dto: DTO<EventSourcedSpatialFeatureViewModel>
    ): EventSourcedSpatialFeatureViewModel {
        return new EventSourcedSpatialFeatureViewModel(dto);
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
