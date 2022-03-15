import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { EntityType } from '../types/entityType';
import { EntityId } from './types/entity-id';
import { EntityCompositeIdentifier } from './types/entityCompositeIdentifier';

// TODO Extract to a separate location
const isValidStringWithLength = (input: unknown): input is string =>
  typeof input === 'string' && input.length > 0;

/**
 *
 * TODO move this near the corresponding type. Note that this extra layer is
 * meant to safe guard us in case we want stricter validation on an `entity id`.
 * Should we change the rule, we can update this in once place, instead of replacing
 * `isValidStringWithLength` everywhere.
 */
const isValidEntityId = (input: unknown): input is EntityId =>
  isValidStringWithLength(input);

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
    const result = JSON.parse(JSON.stringify(this));

    return result;
  }
}
