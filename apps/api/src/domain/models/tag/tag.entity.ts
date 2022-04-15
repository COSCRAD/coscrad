import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { resourceTypes } from '../../types/resourceTypes';
import { EdgeConnectionContextType } from '../context/types/EdgeConnectionContextType';
import { Resource } from '../resource.entity';

export class Tag extends Resource {
    type = resourceTypes.tag;

    readonly allowedContextTypes = [EdgeConnectionContextType.general];

    text: string;

    // Draft mode not currently supported for tags
    published = true;

    constructor(dto: PartialDTO<Tag>) {
        super({ ...dto, type: resourceTypes.tag });

        this.text = dto.text;
    }
}
