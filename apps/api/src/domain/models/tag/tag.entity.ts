import { DTO } from '../../../types/DTO';
import { EntityId } from '../../types/ResourceId';
import BaseDomainModel from '../BaseDomainModel';

export class Tag extends BaseDomainModel {
    id: EntityId;

    text: string;

    constructor(dto: DTO<Tag>) {
        super();

        this.id = dto.id;

        this.text = dto.text;
    }
}
