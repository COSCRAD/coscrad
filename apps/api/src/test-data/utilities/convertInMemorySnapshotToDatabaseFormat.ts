import BaseDomainModel from '../../domain/models/BaseDomainModel';
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
import { DTO } from '../../types/DTO';

type InMemoryDatabaseSnapshot = {
    documentCollections: {
        [K in Exclude<ArangoCollectionId, 'uuids'>]: unknown[];
    } & { uuids: UuidDocument<AggregateId>[] };

    edgeCollections: {
        [K in ArangoEdgeCollectionId]: Record<string, unknown>[];
    };
};

const toDto = <T extends BaseDomainModel>(model: T): DTO<T> => model.toDTO();

export default (snapshot: InMemorySnapshot): InMemoryDatabaseSnapshot => {
    const databaseTags = snapshot.tags.map(toDto).map(mapEntityDTOToDatabaseDTO);

    return {
        documentCollections: {
            tags: databaseTags,
            categories: snapshot.categoryTree.map(toDto).map(mapCategoryDTOToArangoDocument),
            uuids: snapshot.uuids,
            users: snapshot.users.map(toDto).map(mapEntityDTOToDatabaseDTO),
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
