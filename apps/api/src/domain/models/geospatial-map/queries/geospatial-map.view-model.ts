import { BooleanDataType, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { isBoolean, isNonEmptyObject } from '@coscrad/validation-constraints';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { ConnectionRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { SpatialFeatureProperties } from '../../spatial-feature/point/entities/spatial-feature-properties.entity';
import { GeometryViewModel } from '../../spatial-feature/queries/spatial-feature.view-model.event-sourced';
import { ContributionSummary } from '../../user-management';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { GeospatialMapCompositeIdentifier } from '../commands/create-map.command';

export class SpatialFeatureViewForMap {
    id: AggregateId;
    geometry: GeometryViewModel;
    properties: SpatialFeatureProperties;
}

@CoscradDataExample<GeospatialMapViewModel>({
    example: {
        type: ResourceType.map,
        id: buildDummyUuid(8),
        isPublished: true,
        name: buildMultilingualTextWithSingleItem('test map name'),
        description: buildMultilingualTextWithSingleItem('test description name'),
        tags: [],
        notes: {},
        connections: {},
        contributions: [],
        spatialFeaturesById: {},
    },
})
export class GeospatialMapViewModel {
    // @Literal
    readonly type = ResourceType.map;

    @NonEmptyString({
        label: 'id for the geospatial map',
        description: 'id for the geospatial map',
    })
    id: string;

    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'name',
        description: 'name for the map',
    })
    readonly name: MultilingualText;

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

    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'description',
        description: 'description for map',
    })
    readonly description: MultilingualText;

    @NestedDataType(EventSourcedTagViewModel, {
        label: 'tags',
        description: 'a summary of the tags that have been applied to this resource',
        isArray: true,
    })
    tags: EventSourcedTagViewModel[];

    notes: Record<AggregateId, NoteRecordForResourceViewModel> = {};

    connections: Record<string, ConnectionRecordForResourceViewModel>;

    // @Lookuptable
    spatialFeaturesById: Record<AggregateId, SpatialFeatureViewForMap> = {};

    constructor(viewModelDto: DTO<GeospatialMapViewModel>) {
        const { id, name, description, tags, notes, connections, isPublished, contributions } =
            viewModelDto;

        this.id = id;

        this.isPublished = isBoolean(isPublished) ? isPublished : false;

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];

        this.notes = isNonEmptyObject(notes) ? cloneToPlainObject(notes) : {};

        this.contributions = Array.isArray(contributions)
            ? contributions.map((c) => ContributionSummary.fromDto(c))
            : [];

        this.connections = isNonEmptyObject(connections) ? cloneToPlainObject(connections) : {};
    }

    // TODO can we have some kind of warning if we get the casing wrong on ~~fromDTO~~  -> `fromDto`?
    static fromDto(dto: DTO<GeospatialMapViewModel>): GeospatialMapViewModel {
        return new GeospatialMapViewModel(dto);
    }
}
