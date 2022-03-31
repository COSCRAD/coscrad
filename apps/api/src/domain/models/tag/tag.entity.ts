import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { entityTypes } from '../../types/entityTypes';
import { Entity } from '../entity';

export class Tag extends Entity {
    type = entityTypes.tag;

    text: string;

    // Draft mode not currently supported for tags
    published = true;

    constructor(dto: PartialDTO<Tag>) {
        super(dto);

        this.text = dto.text;
    }
}
