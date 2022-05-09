import { ResourceCompositeIdentifier } from '../../../domain/models/types/ResourceCompositeIdentifier';
import { getArangoCollectionIDFromResourceType } from '../getArangoCollectionIDFromResourceType';
import { ArangoDocumentHandle } from '../types/ArangoDocumentHandle';

export default ({ type: resourceType, id }: ResourceCompositeIdentifier): ArangoDocumentHandle =>
    `${getArangoCollectionIDFromResourceType(resourceType)}/${id}`;
