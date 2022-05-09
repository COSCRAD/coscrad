import { InternalError } from '../../lib/errors/InternalError';
import { Valid } from '../domainModelValidators/Valid';
import { InMemorySnapshot } from '../types/resourceTypes';

export interface ValidatesItsExternalState {
    validateExternalState(externalState: InMemorySnapshot): Valid | InternalError;
}
