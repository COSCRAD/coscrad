import { ResourceCompositeIdentifier } from '../../models/types/entityCompositeIdentifier';
import { ResourceId } from '../../types/ResourceId';

type ContextType = string;

type ContextData = Record<string, unknown>;

type Context = {
    contextType: ContextType;

    data: ContextData;
};

type ContextMetadata = {
    // These will be stored by reference
    tags: ResourceId[];

    note: string;
};

type SelfResourceContext = {
    self: Context;
} & ContextMetadata;

type ConnectedResourceContext = SelfResourceContext & {
    other: Context;
};

type EdgeConnection = {
    /**
     * This only needs to be unique within the array of EdgeConnections for this resource.
     * We can use the edge document ID if we want, but this is an implementation detail.
     */
    id: string;

    context: ConnectedResourceContext;
};

type ConnectedResource = {
    compositeIdentifier: ResourceCompositeIdentifier;

    connections: EdgeConnection[];
};

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
