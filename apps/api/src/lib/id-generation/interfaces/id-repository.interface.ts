import { Maybe } from '../../types/maybe';
import { UuidDocument } from '../types/UuidDocument';

export interface IIdRepository<TIdFormat> {
    create(id: TIdFormat): Promise<void>;

    reserve(id: TIdFormat): Promise<void>;

    fetchById(id: TIdFormat): Promise<Maybe<UuidDocument<TIdFormat>>>;
}
