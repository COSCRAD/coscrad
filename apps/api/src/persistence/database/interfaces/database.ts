import { EntityId } from 'apps/api/src/domain/types/EntityId';
import { Maybe } from 'apps/api/src/lib/types/maybe';

export interface IDatabase {
    fetchById: <TEntityDTO>(id: EntityId, collectionName: string) => Promise<Maybe<TEntityDTO>>;

    fetchMany: <TEntityDTO>(collectionName: string) => Promise<Maybe<TEntityDTO[]>>;

    create: <TEntityDTO>(dto: TEntityDTO, collectionName: string) => Promise<void>;

    createMany: <TEntityDTO>(dto: TEntityDTO[], collectionName: string) => Promise<void>;

    getCount: (collectionName: string) => Promise<number>;

    update: <TEntityDTO>(id: EntityId, dto: TEntityDTO, collectionName: string) => Promise<void>;
}
