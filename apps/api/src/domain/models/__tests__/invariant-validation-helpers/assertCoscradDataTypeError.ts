import { InternalError } from '../../../../lib/errors/InternalError';

/**
 * Note: this assertion will succeed if there is any error
 * message anywhere in the chain of `innerErrors` that references
 * the given property key.
 */
export default (result: InternalError, propertyKey: string) => {
    expect(result.toString().includes(propertyKey)).toBe(true);
};
