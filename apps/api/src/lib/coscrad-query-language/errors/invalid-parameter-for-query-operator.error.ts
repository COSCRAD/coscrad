import { InternalError } from '../../errors/InternalError';
import { CoscradBooleanOperator } from '../models/coscrad-filter-condition';

export class InvalidParameterTypeForQueryOperator extends InternalError {
    constructor(
        index: number,
        actualValue: unknown,
        expectedType: string,
        operator: CoscradBooleanOperator
    ) {
        const msg = `Invalid parameter for COSCRAD query filter operator: ${operator} at index: ${index}. Expected ${expectedType}; received: ${actualValue}.`;

        super(msg);
    }
}
