// Update this
type ConnectedResource = unknown;

// We may want to make this generic to correlate Resource and Context Types
export interface IConnectionRepositoryForResource {
    // Reads
    // add specification-based filtering when needed
    fetchMany(): Promise<ConnectedResource[]>;

    // add specification-based filtering when needed
    count(): Promise<number>;
}
