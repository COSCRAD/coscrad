import { EntityId, isResourceId } from '../../../domain/types/ResourceId';
import { InternalError } from '../../../lib/errors/InternalError';
import { ArangoCollectionID, isArangoCollectionID } from '../types/ArangoCollectionId';
import { ArangoDocumentHandle } from '../types/ArangoDocumentHandle';

type ArangoCompositeIdentifier = {
    collection: ArangoCollectionID;
    id: EntityId;
};

export default (handle: ArangoDocumentHandle): ArangoCompositeIdentifier => {
    const splitOnSlash = handle.split('/');

    if (splitOnSlash.length !== 2) {
        throw new InternalError(`Failed to parse an invalid Arango document handle: ${handle}`);
    }

    const [collectionID, entityID] = splitOnSlash;

    if (!isArangoCollectionID(collectionID)) {
        throw new InternalError(
            `Invalid arango collection ID: ${collectionID} in Arango document handle: ${handle}`
        );
    }

    if (!isResourceId(entityID)) {
        throw new InternalError(
            `Invalid entity ID: ${entityID} in Arango document handle: ${handle}`
        );
    }

    // If we made it this far, we are parsing a valid Arango document handle
    return {
        collection: collectionID,
        id: entityID,
    };
};
