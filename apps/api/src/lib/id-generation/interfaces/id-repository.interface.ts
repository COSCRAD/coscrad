import { UniquelyIdentifiableType } from '../../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../../domain/types/AggregateId';
import { Maybe } from '../../types/maybe';
import { UuidDocument } from '../types/UuidDocument';

// Dependency injection token
export const ID_RESPOSITORY_TOKEN = 'IdRepository';

export interface IIdRepository {
    create(id: AggregateId): Promise<void>;

    reserve({ id, type }: { id: AggregateId; type: UniquelyIdentifiableType }): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<UuidDocument>>;
}
