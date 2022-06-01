import { ArangoCollectionId } from '../collection-references/ArangoCollectionId';

export type ArangoDocumentHandle = `${ArangoCollectionId}/${string}`;
