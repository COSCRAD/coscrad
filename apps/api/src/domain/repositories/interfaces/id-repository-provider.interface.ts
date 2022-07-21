import { IIdRepository } from '../../../lib/id-generation/interfaces/id-repository.interface';
import { AggregateId } from '../../types/AggregateId';

export interface IIdRepositoryProvider {
    getIdRepository(): IIdRepository<AggregateId>;
}
