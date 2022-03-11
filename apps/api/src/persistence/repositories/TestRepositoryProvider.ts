import { Entity } from '../../domain/models/entity';
import { EntityType, InMemorySnapshot } from '../../domain/types/entityType';
import { DatabaseProvider } from '../database/database.provider';
import { getArangoCollectionIDFromEntityType } from '../database/get-arango-collection-ids';
import { RepositoryProvider } from './repository.provider';

export default class TestRepositoryProvider extends RepositoryProvider {
  constructor(databaseProvider: DatabaseProvider) {
    super(databaseProvider);
  }

  // TODO We should correlate entity type with TEntity here
  public async addEntitiesOfSingleType<TEntity extends Entity>(
    entityType: EntityType,
    entities: TEntity[]
  ): Promise<void> {
    await this.forEntity<TEntity>(entityType).createMany(entities);
  }

  // TODO fix types
  public async addEntitiesOfManyTypes(
    snapshot: InMemorySnapshot
  ): Promise<void> {
    const writePromises = Object.entries(snapshot).map(
      ([entityType, entityInstances]) =>
        this.addEntitiesOfSingleType(
          entityType as EntityType,
          entityInstances as any
        )
    );
  }

  public async deleteAllEntitiesOfGivenType(
    entityType: EntityType
  ): Promise<void> {
    await (
      await this.databaseProvider.getDBInstance()
    ).deleteAll(getArangoCollectionIDFromEntityType(entityType));
  }
}
