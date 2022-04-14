import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';

/**
 * A `ResourceId` is an `aggregate ID` in the terminology of Domain Driven Design.
 *
 * This type alias allows us to
 * - express our types in a domain-specific \ declarative manner
 * - change the type of all `Resource IDs` in-step in the future
 */
export type EntityId = string;

export const isResourceId = (test: unknown): test is EntityId => isStringWithNonzeroLength(test);
