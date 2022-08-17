import { InternalError } from '../errors/InternalError';

/**
 *
 * Note that the expeccted error that you provide is the source of truth
 * for the depth to which you want to confirm internal errors. This helper
 * only asserts that the result is an error and its inner errors match those
 * specified.
 */
const assertErrorAsExpected = (result: unknown, expectedError: InternalError) => {
    expect(result).toBeInstanceOf(InternalError);

    const error = result as InternalError;

    expect(error).toEqual(expectedError);

    const { innerErrors } = error;

    const { innerErrors: expectedInnerErrors } = expectedError;

    if (expectedInnerErrors.length > 0)
        expectedInnerErrors.forEach((expectedInnerError, index) =>
            assertErrorAsExpected(innerErrors[index], expectedInnerError)
        );
};

export default assertErrorAsExpected;
