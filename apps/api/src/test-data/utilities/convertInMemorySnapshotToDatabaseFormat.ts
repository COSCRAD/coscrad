import { toDto } from '../../domain/models/shared/functional/index';
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
import { ArangoMigrationRecord } from '../../persistence/migrations/arango-migration-record';
import { DTO } from '../../types/DTO';

export type InMemoryDatabaseSnapshot = {
    document: {
        [K in Exclude<ArangoCollectionId, 'uuids' | 'migrations'>]: unknown[];
    } & { uuids: UuidDocument[]; migrations: DTO<ArangoMigrationRecord>[] };

    edge: {
        [K in ArangoEdgeCollectionId]: Record<string, unknown>[];
    };
};

/**
 * TODO [https://www.pivotaltracker.com/story/show/185212566]
 * Consider having a single source of truth for domain-to-persistence
 * layer mapping.
 *
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
