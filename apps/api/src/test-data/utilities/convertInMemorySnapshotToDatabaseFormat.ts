import { Aggregate } from '../../domain/models/aggregate.entity';
import { toDto } from '../../domain/models/shared/functional/index';
import {
    InMemorySnapshot,
    InMemorySnapshotOfResources,
    ResourceType,
} from '../../domain/types/ResourceType';
import { ArangoCollectionId } from '../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoEdgeCollectionId } from '../../persistence/database/collection-references/ArangoEdgeCollectionId';
import { getArangoCollectionIDFromResourceType } from '../../persistence/database/collection-references/getArangoCollectionIDFromResourceType';
import buildEdgeDocumentsFromCategoryNodeDTOs from '../../persistence/database/utilities/category/buildEdgeDocumentsFromCategoryNodeDTOs';
import mapCategoryDTOToArangoDocument from '../../persistence/database/utilities/category/mapCategoryDTOToArangoDocument';
import mapEdgeConnectionDTOToArangoEdgeDocument from '../../persistence/database/utilities/mapEdgeConnectionDTOToArangoEdgeDocument';
import mapEntityDTOToDatabaseDTO from '../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';

// TODO move this
export type DatabaseCollectionSnapshot<TDoc = unknown> = {
    documents: TDoc[];
    checksum: string;
};

export type InMemoryDatabaseSnapshot = {
    document: {
        // can we just use `string` here isntead?
        [K: string]: DatabaseCollectionSnapshot;
    };

    edge: {
        [K in ArangoEdgeCollectionId]: DatabaseCollectionSnapshot;
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
            [ArangoCollectionId.contributors]: snapshot.contributor
                .map(toDto)
                .map(mapEntityDTOToDatabaseDTO),
            // TODO Write UUIDs as well
            [ArangoCollectionId.events]: [
                ...Object.values(snapshot.resources),
                snapshot.category,
                snapshot.note,
                snapshot.tag,
                snapshot.user,
                snapshot.userGroup,
            ].flatMap((instances) =>
                // Here we extract the events from the instances to build the event history. In the future we should just dump the events collection directly
                instances.flatMap(
                    (aggregateRoot: Aggregate) =>
                        aggregateRoot.eventHistory.map((eventRecord) =>
                            mapEntityDTOToDatabaseDTO(eventRecord)
                        ) || []
                )
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
