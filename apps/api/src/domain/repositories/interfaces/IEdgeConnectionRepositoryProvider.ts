import { EntityCompositeIdentifier } from '../../models/types/entityCompositeIdentifier';
import { IConnectionRepositoryForEntity } from './IConnectionRepositoryForEntity';
import { INoteRepository } from './INoteRepository';

export interface IEdgeConnectionRepositoryProvider {
    forEntity(entityCompositeIdentifier: EntityCompositeIdentifier): IConnectionRepositoryForEntity;

    // TODO [design]: Should this go here or on the `RepositoryProvider.forEntity('note')`?
    forNotes(): INoteRepository;
}
