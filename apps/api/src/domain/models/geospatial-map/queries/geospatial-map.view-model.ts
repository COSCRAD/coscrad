import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { ResourceType } from '../../../types/ResourceType';

export class GeospatialMapViewModel {
    readonly type = ResourceType.map;

    readonly name: MultilingualText;

    readonly description: MultilingualText;

    // points: AggregateId[];

    constructor(viewModelDto: DTO<GeospatialMapViewModel>) {
        const { name, description } = viewModelDto;

        this.name = new MultilingualText(name);

        this.description = new MultilingualText(description);
    }
}
