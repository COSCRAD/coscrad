import { AggregateId } from '../types/AggregateId';

export interface IIdGenerator {
    generate: () => Promise<AggregateId>;
}
