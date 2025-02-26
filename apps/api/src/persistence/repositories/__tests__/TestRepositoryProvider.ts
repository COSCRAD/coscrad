import { isString } from '@coscrad/validation-constraints';
import { CoscradEventFactory } from '../../../domain/common';
import { Category } from '../../../domain/models/categories/entities/category.entity';
import { Resource } from '../../../domain/models/resource.entity';
import {
    InMemorySnapshot,
    InMemorySnapshotOfResources,
    ResourceType,
} from '../../../domain/types/ResourceType';
import { InternalError } from '../../../lib/errors/InternalError';
import { DynamicDataTypeFinderService } from '../../../validation';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { getAllArangoDocumentCollectionIDs } from '../../database/collection-references/ArangoDocumentCollectionId';
import { getAllArangoEdgeCollectionIDs } from '../../database/collection-references/ArangoEdgeCollectionId';
import { getArangoCollectionIDFromResourceType } from '../../database/collection-references/getArangoCollectionIDFromResourceType';
import { ArangoDatabaseProvider } from '../../database/database.provider';
import buildEdgeDocumentsFromCategoryNodeDTOs from '../../database/utilities/category/buildEdgeDocumentsFromCategoryNodeDTOs';
import mapEntityDTOToDatabaseDTO from '../../database/utilities/mapEntityDTOToDatabaseDocument';
import { ArangoRepositoryProvider } from '../arango-repository.provider';

export default class TestRepositoryProvider extends ArangoRepositoryProvider {
    constructor(
        databaseProvider: ArangoDatabaseProvider,
        coscradEventFactory: CoscradEventFactory,
        dynamicDataTypeFinderService: DynamicDataTypeFinderService
    ) {
        super(databaseProvider, coscradEventFactory, dynamicDataTypeFinderService);
    }

    // TODO We should correlate entity type with TEntity here
    public async addResourcesOfSingleType<TResource extends Resource>(
        resourceType: ResourceType,
        entities: TResource[]
    ): Promise<void> {
        await this.forResource<TResource>(resourceType)
            .createMany(entities)
            .catch((error) => {
                const innerErrors = isString(error?.message)
                    ? [new InternalError(error.message)]
                    : [];

                throw new InternalError(
                    `Failed to add resources of type: ${resourceType} \n ${JSON.stringify(
                        entities,
                        undefined,
                        4
                    )}`,
                    innerErrors
                );
            });
    }

    /**
     *
     * TODO [https://www.pivotaltracker.com/story/show/183227687]
     * Do this in a way that is extensible to adding new aggregate types.
     * `DeluxeInMemoryStore` \ `InMemorySnapshotInFlatFormat` may help with this.
     */
    public async addFullSnapshot(snapshot: InMemorySnapshot): Promise<void> {
        const {
            resources,
            category: categoryTree,
            tag: tags,
            note: connections,
            user: users,
            userGroup: userGroups,
            contributor: contributors,
        } = snapshot;

        await this.addResourcesOfManyTypes(resources);

        await this.addCategories(categoryTree);

        await this.getTagRepository().createMany(tags);

        await this.getEdgeConnectionRepository().createMany(connections);

        await this.getUserRepository().createMany(users);

        await this.getUserGroupRepository().createMany(userGroups);

        await this.getContributorRepository().createMany(contributors);

        /**
         * Currently, this is done by `createMany` via `create`.
         */
        // const allEvents = new DeluxeInMemoryStore(snapshot).fetchEvents();

        // await this.getEventRepository().appendEvents(allEvents);
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

        await this.databaseProvider.clearViews();
    }

    public async testTeardown(): Promise<void> {
        await this.deleteAllDocumentData();

        await this.deleteAllEdgeDocumentData();
    }
}
