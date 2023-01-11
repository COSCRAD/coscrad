import { isNonEmptyString } from '@coscrad/validation-constraints';

/**
 * This type alias allows us to change the type of all `Aggregate IDs` in-step
 * in the future.
 */
export type AggregateId = string;

export const isAggregateId = (test: unknown): test is AggregateId => isNonEmptyString(test);
