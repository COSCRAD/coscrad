import { Category } from '../../../domain/models/categories/entities/category.entity';
import { Resource } from '../../../domain/models/resource.entity';
import {
    InMemorySnapshot,
    InMemorySnapshotOfResources,
    ResourceType,
} from '../../../domain/types/ResourceType';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { getAllArangoDocumentCollectionIDs } from '../../database/collection-references/ArangoDocumentCollectionId';
import { getAllArangoEdgeCollectionIDs } from '../../database/collection-references/ArangoEdgeCollectionId';
import { getArangoCollectionIDFromResourceType } from '../../database/collection-references/getArangoCollectionIDFromResourceType';
import { DatabaseProvider } from '../../database/database.provider';
import buildEdgeDocumentsFromCategoryNodeDTOs from '../../database/utilities/category/buildEdgeDocumentsFromCategoryNodeDTOs';
import mapEntityDTOToDatabaseDTO from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import { RepositoryProvider } from '../repository.provider';

export default class TestRepositoryProvider extends RepositoryProvider {
    constructor(databaseProvider: DatabaseProvider) {
        super(databaseProvider);
    }

    // TODO We should correlate entity type with TEntity here
    public async addResourcesOfSingleType<TResource extends Resource>(
        resourceType: ResourceType,
        entities: TResource[]
    ): Promise<void> {
        await this.forResource<TResource>(resourceType).createMany(entities);
    }

    public async addFullSnapshot({
        resources,
        categoryTree,
        tags,
        connections,
        users,
    }: InMemorySnapshot): Promise<void> {
        await this.addResourcesOfManyTypes(resources);

        await this.addCategories(categoryTree);

        await this.getTagRepository().createMany(tags);

        await this.getEdgeConnectionRepository().createMany(connections);

        await this.getUserRepository().createMany(users);
    }

    // TODO fix types
    public async addResourcesOfManyTypes(snapshot: InMemorySnapshotOfResources): Promise<void> {
        const writePromises = Object.entries(snapshot).map(([ResourceType, entityInstances]) =>
            this.addResourcesOfSingleType(
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
            .getDatabaseForCollection(ArangoCollectionId.categories)
            .createMany(categoryDocuments);

        await this.databaseProvider
            .getDatabaseForCollection(ArangoCollectionId.categoryEdgeCollectionID)
            .createMany(edgeDocuments);
    }

    public async deleteAllResourcesOfGivenType(ResourceType: ResourceType): Promise<void> {
        await (
            await this.databaseProvider.getDBInstance()
        ).deleteAll(getArangoCollectionIDFromResourceType(ResourceType));
    }

    private async deleteAllEdgeDocumentData(): Promise<void> {
        await Promise.all(
            getAllArangoEdgeCollectionIDs().map((collectionId) =>
                this.databaseProvider.getDBInstance().deleteAll(collectionId)
            )
        );
    }

    /**
     * Deletes all documents from every ordinary document collection;
     */
    private async deleteAllDocumentData(): Promise<void> {
        await Promise.all(
            getAllArangoDocumentCollectionIDs().map((collectionId) =>
                this.databaseProvider.getDBInstance().deleteAll(collectionId)
            )
        );
    }

    public async testSetup(): Promise<void> {
        // In case the last test didn't clean up
        await this.deleteAllDocumentData();

        await this.deleteAllEdgeDocumentData();
    }

    public async testTeardown(): Promise<void> {
        await this.deleteAllDocumentData();

        await this.deleteAllEdgeDocumentData();
    }
}
