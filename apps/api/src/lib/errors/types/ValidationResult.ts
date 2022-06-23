import { Valid } from '../../../domain/domainModelValidators/Valid';
import { InternalError } from '../InternalError';

/**
 * We may want to change the return type of all of our validation functions \
 * validator methods at some point in the future. For example, we may want to simply
 * return an array of errors so that we can more easily chain validators together.
 *
 * Using this type will make that transition easier.
 */
export type ValidationResult = Valid | InternalError;
