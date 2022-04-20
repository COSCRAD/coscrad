import { ResourceCompositeIdentifier } from 'apps/api/src/domain/models/types/entityCompositeIdentifier';
import { getArangoCollectionIDFromResourceType } from '../getArangoCollectionIDFromResourceType';
import { ArangoDocumentHandle } from '../types/ArangoDocumentHandle';

export default ({ type: resourceType, id }: ResourceCompositeIdentifier): ArangoDocumentHandle =>
    `${getArangoCollectionIDFromResourceType(resourceType)}/${id}`;
