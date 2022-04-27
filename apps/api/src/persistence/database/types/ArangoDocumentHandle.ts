import { ArangoResourceCollectionID } from './ArangoCollectionId';

export type ArangoDocumentHandle = `${ArangoResourceCollectionID}/${string}`;
