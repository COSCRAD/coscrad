import { AggregateId, isAggregateId } from '../../../domain/types/AggregateId';
import { InternalError } from '../../../lib/errors/InternalError';
import { ArangoCollectionID, isArangoCollectionID } from '../types/ArangoCollectionId';
import { ArangoDocumentHandle } from '../types/ArangoDocumentHandle';

type ArangoCompositeIdentifier = {
    collection: ArangoCollectionID;
    id: AggregateId;
};

export default (handle: ArangoDocumentHandle): ArangoCompositeIdentifier => {
    const splitOnSlash = handle.split('/');

    if (splitOnSlash.length !== 2) {
        throw new InternalError(`Failed to parse an invalid Arango document handle: ${handle}`);
    }

    const [collectionID, aggregateId] = splitOnSlash;

    if (!isArangoCollectionID(collectionID)) {
        throw new InternalError(
            `Invalid arango collection ID: ${collectionID} in Arango document handle: ${handle}`
        );
    }

    if (!isAggregateId(aggregateId)) {
        throw new InternalError(
            `Invalid entity ID: ${aggregateId} in Arango document handle: ${handle}`
        );
    }

    // If we made it this far, we are parsing a valid Arango document handle
    return {
        collection: collectionID,
        id: aggregateId,
    };
};
