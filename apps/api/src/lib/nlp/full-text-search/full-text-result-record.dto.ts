export class FullTextSearchRecord {
    // name: string;

    /**
     * The client must make a subsequent request (or pull a cache from the local store)
     * to get the full view.
     */
    compositeIdentifier: {
        type: string;
        id: string;
    };
}
