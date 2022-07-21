import { isNumber } from 'class-validator';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { Valid } from '../../../../Valid';

export default (coordinate: unknown, index?: number): Valid | InternalError => {
    if (
        !isNumber(coordinate, {
            allowInfinity: false,
            allowNaN: false,
        })
    ) {
        const msg = [
            `Encountered an invalid coordinate: ${coordinate}`,
            index ? `at index ${index}` : ``,
        ].join(' ');

        return new InternalError(msg);
    }

    return Valid;
};
