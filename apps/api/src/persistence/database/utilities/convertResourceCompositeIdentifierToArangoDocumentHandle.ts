import { ResourceCompositeIdentifier } from 'apps/api/src/domain/models/types/entityCompositeIdentifier';
import { getArangoCollectionIDFromResourceType } from '../getArangoCollectionIDFromResourceType';
import { ArangoCollectionID } from '../types/ArangoCollectionId';

type ArangoDocumentHandle = `${ArangoCollectionID}/${string}`;

export default ({ type: resourceType, id }: ResourceCompositeIdentifier): ArangoDocumentHandle =>
    `${getArangoCollectionIDFromResourceType(resourceType)}/${id}`;
