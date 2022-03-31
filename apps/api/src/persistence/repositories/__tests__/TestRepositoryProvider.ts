import { Entity } from '../../../domain/models/entity';
import { EntityType, entityTypes, InMemorySnapshot } from '../../../domain/types/entityTypes';
import { DatabaseProvider } from '../../database/database.provider';
import { getArangoCollectionIDFromEntityType } from '../../database/getArangoCollectionIDFromEntityType';
import { RepositoryProvider } from '../repository.provider';

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
    public async addEntitiesOfManyTypes(snapshot: InMemorySnapshot): Promise<void> {
        const writePromises = Object.entries(snapshot).map(([entityType, entityInstances]) =>
            this.addEntitiesOfSingleType(entityType as EntityType, entityInstances as Entity[])
        );

        await Promise.all(writePromises);
    }

    public async deleteAllEntitiesOfGivenType(entityType: EntityType): Promise<void> {
        await (
            await this.databaseProvider.getDBInstance()
        ).deleteAll(getArangoCollectionIDFromEntityType(entityType));
    }

    /**
     * Deletes all entity data (i.e. empties every entity collection);
     */
    private async deleteAllEntityData(): Promise<void> {
        const deleteAllDataPromises = Object.values(entityTypes).map((entityType: EntityType) =>
            this.deleteAllEntitiesOfGivenType(entityType)
        );

        await Promise.all(deleteAllDataPromises);
    }

    public async testSetup(): Promise<void> {
        // In case the last test didn't clean up
        await this.deleteAllEntityData();
    }

    public async testTeardown(): Promise<void> {
        await this.deleteAllEntityData();
    }
}
