import { isInteger, isNullOrUndefined } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';

const MAX_NUMBER_OF_DIGITS = 5;

export default (sequenceNumber?: number): string => {
    // This was the dummy value used before adding the sequenceNumber option
    if (isNullOrUndefined(sequenceNumber)) return '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

    if (!isInteger(sequenceNumber))
        throw new InternalError(`Invalid sequence number: ${sequenceNumber} (must be an integer)`);

    const numberOfDigits = sequenceNumber.toString().length;

    if (numberOfDigits > MAX_NUMBER_OF_DIGITS) {
        throw new InternalError(
            `Invalid sequence number: ${sequenceNumber} (must have 5 digits or less)`
        );
    }

    return `9b1deb4d-3b7d-4bad-9bdd-2b0d7b100000`
        .slice(0, -numberOfDigits)
        .concat(sequenceNumber.toString());
};
