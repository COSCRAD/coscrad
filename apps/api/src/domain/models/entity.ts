import { PartialDTO } from 'apps/api/src/types/partial-dto';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import { EntityType } from '../types/entityType';
import { EntityId } from './types/entity-id';
import { EntityCompositeIdentifier } from './types/entityCompositeIdentifier';

type EntityConstructor<T extends Entity = Entity> = new (dto: PartialDTO<T>) => T;

export abstract class Entity {
    readonly id: EntityId;

    abstract readonly type: EntityType;

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    constructor(dto: PartialDTO<Entity>) {
        this.id = dto.id;

        this.published = typeof dto.published === 'boolean' ? dto.published : false;
    }

    getCompositeIdentifier = (): EntityCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });

    /**
     * TODO consider moving this to a `Serializable` mixin. There may be cases
     * where we want this behaviour on a non domain-model class without the
     * inheritance baggage.
     *  */
    toDTO<TEntity extends Entity>(this: TEntity): PartialDTO<TEntity> {
        const result = cloneToPlainObject(this);

        return result;
    }

    /**
     * We should consider requiring a clone with updates to pass through the
     * factory and hence the validators, otherwise, clone will allow a backdoor
     * to creating an invalid instance in the system.
     *
     * We only duplicate \ update instances using this method to avoid introducting
     * side-effects. I.e. our entities are immutable data structures.
     */
    clone<T extends Entity>(this: T, overrides: PartialDTO<T> = {}): T {
        return new (this.constructor as EntityConstructor<T>)({
            ...this.toDTO(),
            ...overrides,
        });
    }
}
