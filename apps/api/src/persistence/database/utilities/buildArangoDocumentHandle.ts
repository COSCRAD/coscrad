import { AggregateId } from '../../../domain/types/AggregateId';
import { ArangoCollectionId } from '../collection-references/ArangoCollectionId';

export default (collectionName: ArangoCollectionId, id: AggregateId): string =>
    `${collectionName}/${id}`;
