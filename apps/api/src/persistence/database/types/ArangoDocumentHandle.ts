import { ArangoCollectionID } from './ArangoCollectionId';

export type ArangoDocumentHandle = `${ArangoCollectionID}/${string}`;
