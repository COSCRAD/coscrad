import { Maybe } from 'apps/api/src/lib/types/maybe';
import { EntityCompositeIdentifier } from '../../models/types/entityCompositeIdentifier';
import { EntityId } from '../../types/entity-id';
import { EntityType, entityTypes } from '../../types/entityType';
import { ISpecification } from './ISpecification';

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

const sampleConnection: EdgeConnection = {
    // id?
    to: {
        type: entityTypes.term, // Pretend I am a video
        id: '1234',
    },
    // Note we would never actually do this. we need more entity types!
    from: {
        type: entityTypes.vocabularyList, // Pretend I am a book
        id: '34',
    },
    context: [
        {
            to: {
                contextType: 'timestamp',
                data: {
                    timestamp: {
                        in: '00:23:32',
                        out: '00:45:13',
                    },
                },
            },
            from: {
                contextType: 'pageRange', //ContextType.pageRange
                data: {
                    pageRange: ['x', '1', '12', '123', 'V', '124', '125', '126'], // New PageRange(new Range(123,126))
                },
            },
            tags: [],
            note: 'The historical account of how the trail was built is portrayed in the video.',
        },
    ],
};

const sampleSelfConnection: EdgeConnection = {
    // id?
    to: {
        type: entityTypes.term, // Pretend I am a book
        id: '1234',
    },
    // Note do we want a different type for a self connection? e.g. a single `self` field?
    from: {
        type: entityTypes.term, // Pretend I am a book
        id: '1234',
    },
    context: [
        {
            // We should just have a single 'self' prop instead of dupulicating data
            to: {
                contextType: 'pageRange', //ContextType.pageRange
                data: {
                    pageRange: ['33'], // New PageRange(new Range(123,126))
                },
            },
            from: {
                contextType: 'pageRange', //ContextType.pageRange
                data: {
                    pageRange: ['33'], // New PageRange(new Range(123,126))
                },
            },
            tags: ['11', '17'], // tagId: 11 <-> 'animals', '17' ,-> 'bears'
            note: 'This page is about bears',
        },
        {
            // We should just have a single 'self' prop instead of dupulicating data
            to: {
                contextType: 'pageRange', //ContextType.pageRange
                data: {
                    pageRange: ['44', '45', '46', '47'], // New PageRange(new Range(123,126))
                },
            },
            // We should just have a single 'self' prop instead of dupulicating data
            from: {
                contextType: 'pageRange', //ContextType.pageRange
                data: {
                    pageRange: ['44', '45', '46', '47'], // New PageRange(new Range(123,126))
                },
            },
            tags: ['12'], // tagId: 12 <-> 'legeds'
            note: 'This one is about how the sun was made',
        },
    ],
};

export interface IConnectionRepository {
    // "Queries"
    getConnectionsToEntity(
        compositeID: EntityCompositeIdentifier,
        options: ConnectionQueryOptions
    ): Promise<RelatedEntities>;

    fetchMany(specification?: ISpecification<EdgeConnection>): Promise<EdgeConnection[]>;

    // Maybe this should take in the composite Identifier(s) in case you are using that as an id
    fetchOne(specification?: ISpecification<EdgeConnection>): Promise<Maybe<EdgeConnection>>;

    fetchById(
        // or should this be the doc ID???
        edgeConnectionCompositeID: Promise<EdgeConnectionCompositeIdentifier>
    ): Promise<Maybe<EdgeConnection>>;

    // I prefer count to `getCount` let's change the entity repos too
    count(specification?: ISpecification<EdgeConnection>): Promise<number>;

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
