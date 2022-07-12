import { ValidationResult } from '../../../../../../lib/errors/types/ValidationResult';
import { Valid } from '../../../../../domainModelValidators/Valid';

// There are no complex invariant validation rules for this model
export default (_: unknown): ValidationResult => Valid;
