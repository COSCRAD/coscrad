import { ResourceCompositeIdentifier } from '../../../domain/types/ResourceCompositeIdentifier';
import { getArangoCollectionIDFromResourceType } from '../collection-references/getArangoCollectionIDFromResourceType';
import { ArangoDocumentHandle } from '../types/ArangoDocumentHandle';

export default ({ type: resourceType, id }: ResourceCompositeIdentifier): ArangoDocumentHandle =>
    `${getArangoCollectionIDFromResourceType(resourceType)}/${id}`;
