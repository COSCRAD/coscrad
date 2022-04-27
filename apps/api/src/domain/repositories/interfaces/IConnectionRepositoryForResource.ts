// Update this
type ConnectedResource = unknown;

// We may want to make this generic to correlate Resource and Context Types
export interface IConnectionRepositoryForResource {
    // Reads
    // add specification-based filtering when needed
    fetchMany(): Promise<ConnectedResource[]>;

    // add specification-based filtering when needed
    count(): Promise<number>;

    // Writes
    // connect(
    //     relatedEntityCompositeID: EntityCompositeIdentifier,
    //     context: ConnectedEntityContext,
    //     note: string,
    //     // This will hold `tagIDs` as tags are stored by reference
    //     tags: string[]
    // ): Promise<void>;

    // Add delete when it is needed
}
