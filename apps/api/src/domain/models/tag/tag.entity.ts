import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { resourceTypes } from '../../types/resourceTypes';
import { Resource } from '../resource.entity';

export class Tag extends Resource {
    type = resourceTypes.tag;

    text: string;

    // Draft mode not currently supported for tags
    published = true;

    constructor(dto: PartialDTO<Tag>) {
        super(dto);

        this.text = dto.text;
    }
}
