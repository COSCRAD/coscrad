import { EntityId } from '../../types/ResourceId';

export type HasEntityID<T = undefined> = T extends undefined
    ? {
          id: EntityId;
      }
    : {
          id: EntityId;
      } & T;
