import { ResourceId } from 'apps/api/src/domain/types/ResourceId';
import { Maybe } from 'apps/api/src/lib/types/maybe';

export interface IDatabase {
    fetchById: <TEntityDTO>(id: ResourceId, collectionName: string) => Promise<Maybe<TEntityDTO>>;

    fetchMany: <TEntityDTO>(collectionName: string) => Promise<Maybe<TEntityDTO[]>>;

    create: <TEntityDTO>(dto: TEntityDTO, collectionName: string) => Promise<void>;

    createMany: <TEntityDTO>(dto: TEntityDTO[], collectionName: string) => Promise<void>;

    getCount: (collectionName: string) => Promise<number>;

    update: <TEntityDTO>(id: ResourceId, dto: TEntityDTO, collectionName: string) => Promise<void>;
}
