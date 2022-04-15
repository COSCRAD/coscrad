import { Resource } from '../../../domain/models/resource.entity';
import {
    InMemorySnapshotOfResources,
    ResourceType,
    resourceTypes,
} from '../../../domain/types/resourceTypes';
import { DatabaseProvider } from '../../database/database.provider';
import { getArangoCollectionIDFromResourceType } from '../../database/getArangoCollectionIDFromResourceType';
import { RepositoryProvider } from '../repository.provider';

export default class TestRepositoryProvider extends RepositoryProvider {
    constructor(databaseProvider: DatabaseProvider) {
        super(databaseProvider);
    }

    // TODO We should correlate entity type with TEntity here
    public async addEntitiesOfSingleType<TResource extends Resource>(
        ResourceType: ResourceType,
        entities: TResource[]
    ): Promise<void> {
        await this.forResource<TResource>(ResourceType).createMany(entities);
    }

    // TODO fix types
    public async addEntitiesOfManyTypes(snapshot: InMemorySnapshotOfResources): Promise<void> {
        const writePromises = Object.entries(snapshot).map(([ResourceType, entityInstances]) =>
            this.addEntitiesOfSingleType(
                ResourceType as ResourceType,
                entityInstances as Resource[]
            )
        );

        await Promise.all(writePromises);
    }

    public async deleteAllEntitiesOfGivenType(ResourceType: ResourceType): Promise<void> {
        await (
            await this.databaseProvider.getDBInstance()
        ).deleteAll(getArangoCollectionIDFromResourceType(ResourceType));
    }

    /**
     * Deletes all entity data (i.e. empties every entity collection);
     */
    private async deleteAllEntityData(): Promise<void> {
        const deleteAllDataPromises = Object.values(resourceTypes).map(
            (ResourceType: ResourceType) => this.deleteAllEntitiesOfGivenType(ResourceType)
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
