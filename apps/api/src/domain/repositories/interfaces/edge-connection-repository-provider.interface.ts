import { IEdgeConnectionRepository } from './edge-connection-repository.interface';

export interface IEdgeConnectionRepositoryProvider {
    getEdgeConnectionRepository: () => IEdgeConnectionRepository;

    // forResource(
    //     resourceCompositeIdentifier: ResourceCompositeIdentifier
    // ): IConnectionRepositoryForResource;
}
