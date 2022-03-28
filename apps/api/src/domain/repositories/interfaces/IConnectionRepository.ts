import { EntityCompositeIdentifier } from '../../models/types/entityCompositeIdentifier';
import { EntityId } from '../../types/entity-id';
import { EntityType } from '../../types/entityType';

type ContextType = string;

type ContextData = Record<string, unknown>;

type Context = {
    contextType: ContextType;

    contextData: ContextData;
};

type ContextMetadata = {
    // These will be stored by reference
    tags: EntityId[];

    note: string;
};

type EdgeConnectionContext = {
    to: Context;

    from: Context;
} & ContextMetadata;

type EdgeConnectionCompositeIdentifier = {
    to: EntityCompositeIdentifier;
    from: EntityCompositeIdentifier;
};

type EdgeConnection = EdgeConnectionCompositeIdentifier & {
    context: EdgeConnectionContext[];
};

type GraphQueryDirection = 'outgoing' | 'incoming' | 'undirected';

type ConnectionQueryOptions = {
    direction: GraphQueryDirection;
};

type RelatedEntityContext = {
    self: Context;
    other: Context;
} & ContextMetadata;

type RelatedEntity = {
    relatedEntityCompositeID: EntityCompositeIdentifier;

    context: RelatedEntityContext;
};

type RelatedEntities = {
    [K in keyof EntityType]: RelatedEntity[];
};

export interface IConnectionRepository {
    // "Queries"
    getConnectionsToEntity(
        compositeID: EntityCompositeIdentifier,
        options: ConnectionQueryOptions
    ): Promise<RelatedEntities>;

    fetchMany(): Promise<EdgeConnection[]>;

    fetchById(
        edgeConnectionCompositeID: Promise<EdgeConnectionCompositeIdentifier>
    ): EdgeConnection;

    getCount(): Promise<number>;

    // "Commands"
    createConnection(
        entity1: EntityCompositeIdentifier,
        entity2: EntityCompositeIdentifier,
        context: EdgeConnectionContext[]
    ): Promise<void>;

    updateConnections(
        entity1: EntityCompositeIdentifier,
        entity2: EntityCompositeIdentifier,
        context: EdgeConnectionContext[]
    ): Promise<void>;
}
