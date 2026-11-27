import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { GeospatialMapCompositeIdentifier } from '../commands/create-map.command';

export class GeospatialMapViewModel {
    readonly type = ResourceType.map;

    @NonEmptyString({
        label: 'ID',
        description: 'unique identifier for this map',
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

    // spatialFeatures: AggregateId[];

    constructor(viewModelDto: DTO<GeospatialMapViewModel>) {
        const { name, description } = viewModelDto;

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);
    }

    getCompositeIdentifier(): GeospatialMapCompositeIdentifier {
        return {
            type: AggregateType.map,
            id: this.id,
        };
    }
}
