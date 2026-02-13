import { AggregateId } from '../../../domain/types/AggregateId';

export type ArangoFullTextSearchDocument = {
    id: string;
    token: string;
    letters: string;
    entities: Record<string, AggregateId[]>;
};
