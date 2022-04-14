import { ResourceCompositeIdentifier } from '../../models/types/entityCompositeIdentifier';
import { IConnectionRepositoryForResource } from './IConnectionRepositoryForEntity';
import { INoteRepository } from './INoteRepository';

export interface IEdgeConnectionRepositoryProvider {
    forResource(
        resourceCompositeIdentifier: ResourceCompositeIdentifier
    ): IConnectionRepositoryForResource;

    // TODO [design]: Should this go here or on the `RepositoryProvider.forEntity('note')`?
    forNotes(): INoteRepository;
}
