import { IEdgeConnectionRepository } from './IEdgeConnectionRepository';

export interface IEdgeConnectionRepositoryProvider {
    getEdgeConnectionRepository: () => IEdgeConnectionRepository;

    // forResource(
    //     resourceCompositeIdentifier: ResourceCompositeIdentifier
    // ): IConnectionRepositoryForResource;
}
