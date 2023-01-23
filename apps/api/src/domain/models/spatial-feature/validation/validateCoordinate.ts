import { isFiniteNumber } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Valid } from '../../../domainModelValidators/Valid';

export default (coordinate: unknown, index?: number): Valid | InternalError => {
    if (!isFiniteNumber(coordinate)) {
        const msg = [
            `Encountered an invalid coordinate: ${coordinate}`,
            index ? `at index ${index}` : ``,
        ].join(' ');

        return new InternalError(msg);
    }

    return Valid;
};
