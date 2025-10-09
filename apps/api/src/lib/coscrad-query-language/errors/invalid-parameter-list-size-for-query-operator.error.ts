import { InternalError } from '../../errors/InternalError';
import { CoscradBooleanOperator } from '../models/coscrad-filter-condition';

export class InvalidParameterListSizeForQueryOperator extends InternalError {
    constructor(
        expectNumberOfParameters: number,
        actualParameters: unknown[],
        operator: CoscradBooleanOperator
    ) {
        const pluralSuffix = expectNumberOfParameters === 1 ? '' : 's';

        const msg = `Invalid number of parameters received for COSCRAD query filter operator: ${operator}. Expected ${expectNumberOfParameters} parameter${pluralSuffix}, but received: ${actualParameters.length}`;

        super(msg);
    }
}
