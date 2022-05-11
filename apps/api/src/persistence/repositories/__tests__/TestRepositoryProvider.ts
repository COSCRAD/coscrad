import { Category } from '../../../domain/models/categories/entities/category.entity';
import { Resource } from '../../../domain/models/resource.entity';
import {
    InMemorySnapshotOfResources,
    ResourceType,
    resourceTypes,
} from '../../../domain/types/resourceTypes';
import { DatabaseProvider } from '../../database/database.provider';
import { getArangoCollectionIDFromResourceType } from '../../database/getArangoCollectionIDFromResourceType';
import {
    categoryCollectionID,
    categoryEdgeCollectionID,
    edgeConnectionCollectionID,
    tagCollectionID,
} from '../../database/types/ArangoCollectionId';
import buildEdgeDocumentsFromCategoryNodeDTOs from '../../database/utilities/category/buildEdgeDocumentsFromCategoryNodeDTOs';
import mapEntityDTOToDatabaseDTO from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import { RepositoryProvider } from '../repository.provider';

export default class TestRepositoryProvider extends RepositoryProvider {
    constructor(databaseProvider: DatabaseProvider) {
        super(databaseProvider);
    }

    // TODO We should correlate entity type with TEntity here
    public async addEntitiesOfSingleType<TResource extends Resource>(
        resourceType: ResourceType,
        entities: TResource[]
    ): Promise<void> {
        await this.forResource<TResource>(resourceType).createMany(entities);
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

    /**
     * TODO When implementing writes for the ArangoCategoryRepository,
     * remove this helper and use the actual implementation of `createMany` \ `create`.
     */
    public async addCategories(categories: Category[]): Promise<void> {
        const categoryDocuments = categories
            .map(({ id, label, members }) => ({
                id,
                label,
                members,
            }))
            .map(mapEntityDTOToDatabaseDTO);

        const edgeDocuments = buildEdgeDocumentsFromCategoryNodeDTOs(categories);

        await this.databaseProvider
            .getDatabaseForCollection(categoryCollectionID)
            .createMany(categoryDocuments);

        await this.databaseProvider
            .getDatabaseForCollection(categoryEdgeCollectionID)
            .createMany(edgeDocuments);
    }

    public async deleteAllResourcesOfGivenType(ResourceType: ResourceType): Promise<void> {
        await (
            await this.databaseProvider.getDBInstance()
        ).deleteAll(getArangoCollectionIDFromResourceType(ResourceType));
    }

    public async deleteAllTags(): Promise<void> {
        await this.databaseProvider.getDBInstance().deleteAll(tagCollectionID);
    }

    public async deleteAllEdges(): Promise<void> {
        await this.databaseProvider.getDBInstance().deleteAll(edgeConnectionCollectionID);

        await this.databaseProvider.getDBInstance().deleteAll(categoryEdgeCollectionID);
    }

    /**
     * Deletes all entity data (i.e. empties every entity collection);
     */
    private async deleteAllEntityData(): Promise<void> {
        const deleteAllDataPromises = Object.values(resourceTypes)
            .map((ResourceType: ResourceType) => this.deleteAllResourcesOfGivenType(ResourceType))
            .concat(this.databaseProvider.getDBInstance().deleteAll(tagCollectionID))
            .concat(this.databaseProvider.getDBInstance().deleteAll(categoryCollectionID));

        await Promise.all(deleteAllDataPromises);
    }

    public async testSetup(): Promise<void> {
        // In case the last test didn't clean up
        await this.deleteAllEntityData();

        await this.deleteAllEdges();
    }

    public async testTeardown(): Promise<void> {
        await this.deleteAllEntityData();

        await this.deleteAllEdges();

        await this.deleteAllTags();
    }
}
