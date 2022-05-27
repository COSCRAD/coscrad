import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const mediaItemValidator: DomainModelValidator = (_: unknown) => {
    return Valid;
};

export default mediaItemValidator;
