import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { SpatialFeatureProperties } from '../../spatial-feature/point/entities/spatial-feature-properties.entity';
import { GeometryViewModel } from '../../spatial-feature/queries/spatial-feature.view-model.event-sourced';
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
        name: buildMultilingualTextWithSingleItem('test map name'),
        description: buildMultilingualTextWithSingleItem('test description name'),
        tags: [],
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

    // @Lookuptable
    spatialFeaturesById: Record<AggregateId, SpatialFeatureViewForMap> = {};

    constructor(viewModelDto: DTO<GeospatialMapViewModel>) {
        const { id, name, description, tags } = viewModelDto;

        this.id = id;

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);

        this.tags = Array.isArray(tags) ? tags.map((t) => new EventSourcedTagViewModel(t)) : [];
    }

    // TODO can we have some kind of warning if we get the casing wrong on ~~fromDTO~~  -> `fromDto`?
    static fromDto(dto: DTO<GeospatialMapViewModel>): GeospatialMapViewModel {
        return new GeospatialMapViewModel(dto);
    }
}
