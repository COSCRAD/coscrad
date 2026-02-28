import { AggregateId } from '../../../domain/types/AggregateId';
import { Token } from '../tokenization';

export type ArangoFullTextSearchDocument = {
    id: string;
    token: Token; // this includes characters
    entities: Record<string, AggregateId[]>;
};
