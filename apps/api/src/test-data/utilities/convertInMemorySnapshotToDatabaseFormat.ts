import { toDto } from '../../domain/models/shared/functional/index';
import { AggregateId } from '../../domain/types/AggregateId';
import {
    InMemorySnapshot,
    InMemorySnapshotOfResources,
    ResourceType,
} from '../../domain/types/ResourceType';
import { UuidDocument } from '../../lib/id-generation/types/UuidDocument';
import { ArangoCollectionId } from '../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoEdgeCollectionId } from '../../persistence/database/collection-references/ArangoEdgeCollectionId';
import { getArangoCollectionIDFromResourceType } from '../../persistence/database/collection-references/getArangoCollectionIDFromResourceType';
import buildEdgeDocumentsFromCategoryNodeDTOs from '../../persistence/database/utilities/category/buildEdgeDocumentsFromCategoryNodeDTOs';
import mapCategoryDTOToArangoDocument from '../../persistence/database/utilities/category/mapCategoryDTOToArangoDocument';
import mapEdgeConnectionDTOToArangoEdgeDocument from '../../persistence/database/utilities/mapEdgeConnectionDTOToArangoEdgeDocument';
import mapEntityDTOToDatabaseDTO from '../../persistence/database/utilities/mapEntityDTOToDatabaseDTO';

type InMemoryDatabaseSnapshot = {
    documentCollections: {
        [K in Exclude<ArangoCollectionId, 'uuids'>]: unknown[];
    } & { uuids: UuidDocument<AggregateId>[] };

    edgeCollections: {
        [K in ArangoEdgeCollectionId]: Record<string, unknown>[];
    };
};

export default (snapshot: InMemorySnapshot): InMemoryDatabaseSnapshot => {
    const databaseTags = snapshot.tags.map(toDto).map(mapEntityDTOToDatabaseDTO);

    return {
        documentCollections: {
            [ArangoCollectionId.tags]: databaseTags,
            [ArangoCollectionId.categories]: snapshot.categoryTree
                .map(toDto)
                .map(mapCategoryDTOToArangoDocument),
            [ArangoCollectionId.uuids]: snapshot.uuids,
            [ArangoCollectionId.users]: snapshot.users.map(toDto).map(mapEntityDTOToDatabaseDTO),
            [ArangoCollectionId.groups]: snapshot.userGroups
                .map(toDto)
                .map(mapEntityDTOToDatabaseDTO),
            ...Object.entries(snapshot.resources).reduce(
                (acc: InMemorySnapshotOfResources, [key, resources]) => ({
                    ...acc,
                    [getArangoCollectionIDFromResourceType(key as ResourceType)]: resources
                        .map(toDto)
                        .map(mapEntityDTOToDatabaseDTO),
                }),
                {} as InMemorySnapshotOfResources
            ),
        },

        edgeCollections: {
            category_edges: buildEdgeDocumentsFromCategoryNodeDTOs(snapshot.categoryTree),
            resource_edge_connections: snapshot.connections
                .map(toDto)
                .map(mapEdgeConnectionDTOToArangoEdgeDocument),
        },
    } as unknown as InMemoryDatabaseSnapshot;
};
