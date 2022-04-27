import { IEdgeConnectionRepository } from './IEdgeConnectionRepository';

export interface IEdgeConnectionRepositoryProvider {
    getEdgeConnectionRepository: () => IEdgeConnectionRepository;

    // Add write methods when implementing commands
    // create: (entity: EdgeConnection) => Promise<void>;

    // // Consider using transactions instead
    // createMany: (entities: EdgeConnection[]) => Promise<void>;

    // forResource(
    //     resourceCompositeIdentifier: ResourceCompositeIdentifier
    // ): IConnectionRepositoryForResource;
}
