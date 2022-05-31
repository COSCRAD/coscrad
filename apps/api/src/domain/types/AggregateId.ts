import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';

/**
 * This type alias allows us to change the type of all `Aggregate IDs` in-step
 * in the future.
 */
export type AggregateId = string;

export const isAggregateId = (test: unknown): test is AggregateId =>
    isStringWithNonzeroLength(test);
