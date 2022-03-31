import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';

/**
 * This type alias allows us to
 * - express our types in a domain-specific \ declarative manner
 * - change the type of all `Entity IDs` in-step in the future
 */
export type EntityId = string;

export const isEntityId = (test: unknown): test is EntityId =>
  isStringWithNonzeroLength(test);
