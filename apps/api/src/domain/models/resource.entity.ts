import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { ResourceId } from '../types/ResourceId';
import { ResourceType } from '../types/resourceTypes';
import BaseDomainModel from './BaseDomainModel';
import { ResourceCompositeIdentifier } from './types/entityCompositeIdentifier';

export abstract class Resource extends BaseDomainModel {
    readonly id: ResourceId;

    abstract readonly type: ResourceType;

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    constructor(dto: PartialDTO<Resource>) {
        super();

        this.id = dto.id;

        this.published = typeof dto.published === 'boolean' ? dto.published : false;
    }

    getCompositeIdentifier = (): ResourceCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });
}
