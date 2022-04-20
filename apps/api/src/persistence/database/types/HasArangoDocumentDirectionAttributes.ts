type ToAndFrom = {
    _to: string;

    _from: string;
};

export type HasArangoDocumentDirectionAttributes<T = undefined> = T extends undefined
    ? ToAndFrom
    : ToAndFrom & T;
