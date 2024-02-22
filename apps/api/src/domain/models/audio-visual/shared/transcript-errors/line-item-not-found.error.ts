import { InternalError } from '../../../../../lib/errors/InternalError';
import formatTimeRange from '../../../../../queries/presentation/formatTimeRange';

export class LineItemNotFoundError extends InternalError {
    constructor({
        inPointMilliseconds,
        outPointMilliseconds,
    }: {
        inPointMilliseconds: number;
        outPointMilliseconds: number;
    }) {
        const msg = `There is no line item with time stamps: ${formatTimeRange({
            inPointMilliseconds,
            outPointMilliseconds,
        })}`;

        super(msg);
    }
}
