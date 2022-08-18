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
    document: {
        [K in Exclude<ArangoCollectionId, 'uuids'>]: unknown[];
    } & { uuids: UuidDocument<AggregateId>[] };

    edge: {
        [K in ArangoEdgeCollectionId]: Record<string, unknown>[];
    };
};

/**
 * TODO Leverage `DeluxeInMemroySnapshot` for this logic.
 */
export default (snapshot: InMemorySnapshot): InMemoryDatabaseSnapshot => {
    const databaseTags = snapshot.tag.map(toDto).map(mapEntityDTOToDatabaseDTO);

    return {
        document: {
            [ArangoCollectionId.tags]: databaseTags,
            [ArangoCollectionId.categories]: snapshot.category
                .map(toDto)
                .map(mapCategoryDTOToArangoDocument),
            [ArangoCollectionId.uuids]: snapshot.uuid,
            [ArangoCollectionId.users]: snapshot.user.map(toDto).map(mapEntityDTOToDatabaseDTO),
            [ArangoCollectionId.groups]: snapshot.userGroup
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

        edge: {
            category_edges: buildEdgeDocumentsFromCategoryNodeDTOs(snapshot.category),
            resource_edge_connections: snapshot.note
                .map(toDto)
                .map(mapEdgeConnectionDTOToArangoEdgeDocument),
        },
    } as unknown as InMemoryDatabaseSnapshot;
};
