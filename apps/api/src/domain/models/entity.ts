import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { EntityType } from '../types/entityTypes';
import BaseDomainModel from './BaseDomainModel';
import { EntityCompositeIdentifier } from './types/entityCompositeIdentifier';
import { EntityId } from './types/EntityId';

export abstract class Entity extends BaseDomainModel {
    readonly id: EntityId;

    abstract readonly type: EntityType;

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    constructor(dto: PartialDTO<Entity>) {
        super();

        this.id = dto.id;

        this.published = typeof dto.published === 'boolean' ? dto.published : false;
    }

    getCompositeIdentifier = (): EntityCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });
}
