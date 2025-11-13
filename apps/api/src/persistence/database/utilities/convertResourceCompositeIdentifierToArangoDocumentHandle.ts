import { ResourceCompositeIdentifier } from '../../../domain/types/ResourceCompositeIdentifier';
import { getArangoCollectionIDFromResourceType } from '../collection-references/getArangoCollectionIDFromResourceType';
import { ArangoDocumentHandle } from '../types/ArangoDocumentHandle';

export default (
    { type: resourceType, id }: ResourceCompositeIdentifier,
    /**
     * TODO This is a hack. Originally, we statically registered resource types.
     * As we progressed, we began to look at dynamically registering these. As such,
     * we do not maintain a lookup table for the view layer. When working with
     * the `{resourceType}__VIEWS` collections, override the following logic.
     */
    getCollectionId: (rt: string) => string = getArangoCollectionIDFromResourceType
): ArangoDocumentHandle => `${getCollectionId(resourceType)}/${id}`;
