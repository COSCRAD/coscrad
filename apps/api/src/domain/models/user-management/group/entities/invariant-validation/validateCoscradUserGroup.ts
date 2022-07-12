import { ValidationResult } from '../../../../../../lib/errors/types/ValidationResult';
import { Valid } from '../../../../../domainModelValidators/Valid';

export default (_: unknown): ValidationResult => {
    return Valid;
};
