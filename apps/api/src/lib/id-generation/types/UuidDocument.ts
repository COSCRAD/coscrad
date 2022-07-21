export type UuidDocument<TIdFormat> = {
    id: TIdFormat;
    /**
     * We could have chosen to store a composite ID for the aggregate that is using
     * this ID. This would allow us efficient look up from plain UUID (without
     * a collection name \ type discriminant) to an actual document \ instance.
     *
     * However, we have built our system to use composite identifiers everywhere
     * (consistent with Arango's design), so this isn't necessary.
     */
    isAvailable: boolean;
};
