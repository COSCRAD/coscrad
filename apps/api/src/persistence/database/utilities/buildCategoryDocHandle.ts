import { categoryCollectionID } from '../types/ArangoCollectionId';
import { ArangoDocumentHandle } from '../types/ArangoDocumentHandle';

// TODO Generalize this to `buildArangoDocHandle` and take in the collectionID
export default (id: string): ArangoDocumentHandle => `${categoryCollectionID}/${id}`;
