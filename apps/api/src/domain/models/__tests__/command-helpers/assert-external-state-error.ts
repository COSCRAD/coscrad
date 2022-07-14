import { InternalError } from '../../../../lib/errors/InternalError';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../shared/common-command-errors/InvalidExternalStateError';

export const assertExternalStateError = (
    result: unknown,
    expectedInnermostError?: InternalError
): void => {
    expect(result).toBeInstanceOf(CommandExecutionError);

    const innerError = (result as CommandExecutionError).innerErrors[0];

    expect(innerError).toBeInstanceOf(InvalidExternalStateError);

    const innerMostError = innerError.innerErrors[0];

    if (!isNullOrUndefined(expectedInnermostError))
        expect(innerMostError).toEqual(expectedInnermostError);
};
