import { AggregateId } from '../types/AggregateId';

export interface IIdGenerator {
    /**
     * Generates a new ID and marks it as available in the database. Returns
     * the new ID for subsequent use by the client.
     */
    generate: () => Promise<AggregateId>;
}
