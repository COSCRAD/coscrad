import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import NullOrUndefinedAggregateDTOError from '../../../../domainModelValidators/errors/NullOrUndefinedAggregateDTOError';
import { DomainModelValidator } from '../../../../domainModelValidators/types/DomainModelValidator';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';

const validateCoscradUser: DomainModelValidator = (dto: unknown): ValidationResult => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedAggregateDTOError(AggregateType.user);

    return Valid;
};

export default validateCoscradUser;
