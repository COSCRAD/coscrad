import { DTO } from 'apps/api/src/types/DTO';
import { resourceTypes } from '../../types/resourceTypes';
import { Resource } from '../resource.entity';

export class Tag extends Resource {
    type = resourceTypes.tag;

    text: string;

    // Draft mode not currently supported for tags
    published = true;

    constructor(dto: DTO<Tag>) {
        super({ ...dto, type: resourceTypes.tag });

        this.text = dto.text;
    }
}
