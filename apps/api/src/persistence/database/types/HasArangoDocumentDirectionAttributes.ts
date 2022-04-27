import { ArangoDocumentHandle } from './ArangoDocumentHandle';

type ToAndFrom = {
    _to: ArangoDocumentHandle;

    _from: ArangoDocumentHandle;
};

export type HasArangoDocumentDirectionAttributes<T = undefined> = T extends undefined
    ? ToAndFrom
    : ToAndFrom & T;
