import { EntityCompositeIdentifier } from '../../models/types/entityCompositeIdentifier';
import { EntityId } from '../../types/EntityId';

type ContextType = string;

type ContextData = Record<string, unknown>;

type Context = {
    contextType: ContextType;

    data: ContextData;
};

type ContextMetadata = {
    // These will be stored by reference
    tags: EntityId[];

    note: string;
};

type SelfEntityContext = {
    self: Context;
} & ContextMetadata;

type ConnectedEntityContext = SelfEntityContext & {
    other: Context;
};

type EdgeConnection = {
    /**
     * This only needs to be unique within the array of EdgeConnections for this entity.
     * We can use the edge document ID if we want, but this is an implementation detail.
     */
    id: string;

    context: ConnectedEntityContext;
};

type ConnectedEntity = {
    compositeIdentifier: EntityCompositeIdentifier;

    connections: EdgeConnection[];
};

// We may want to make this generic to correlate Entity and Context Types
export interface IConnectionRepositoryForEntity {
    // Reads
    // add specification-based filtering when needed
    fetchMany(): Promise<ConnectedEntity[]>;

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
