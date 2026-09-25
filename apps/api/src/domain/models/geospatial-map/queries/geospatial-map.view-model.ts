import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { ResourceType } from '../../../types/ResourceType';
import { GeospatialMapCompositeIdentifier } from '../commands/create-map.command';

export class GeospatialMapViewModel {
    readonly type = ResourceType.map;

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

    // spatialFeatures: AggregateId[];

    constructor(viewModelDto: DTO<GeospatialMapViewModel>) {
        const { name, description } = viewModelDto;

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);
    }
}
