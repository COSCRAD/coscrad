import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { isNumber } from 'class-validator';
import { Valid } from '../../../../Valid';

export default (coordinate: number, index?: number): Valid | InternalError => {
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
