import { Resource } from 'apps/api/src/domain/models/resource.entity';
import { IDatabase } from './database';
import { IDatabaseForCollection } from './database-for-collection';

export interface IDatabaseProvider {
    getDBInstance: () => IDatabase;

    getDatabaseForCollection: <TEntity extends Resource>(
        collectionId: string
    ) => IDatabaseForCollection<TEntity>;
}
