import { InternalError } from '../../../../lib/errors/InternalError';

export class CheckboxMustHaveExactlyTwoAllowedValuesError extends InternalError {
    // We program to `unknown[]` because we only need `.length` here.
    constructor(name: string, allowedValues: unknown[]) {
        const msg = `A checkbox vocabulary list filter property must have exactly 2 allowed values (namely "true" and "false"). Encountered a checkbox with ${allowedValues.length} values`;

        super(msg);
    }
}
