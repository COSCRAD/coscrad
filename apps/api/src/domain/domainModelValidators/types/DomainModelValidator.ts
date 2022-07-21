import { InternalError } from '../../../lib/errors/InternalError';
import { Valid } from '../Valid';

export type DomainModelValidator = (inputDTO: unknown) => Valid | InternalError;
