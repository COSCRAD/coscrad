export const isError = (input: unknown): input is Error => input instanceof Error;

export const isInternalError = (input: unknown): input is InternalError =>
    input instanceof InternalError;

export class InternalError extends Error {
    innerErrors: Error[] = [];

    constructor(message: string, innerErrors: Error[] = []) {
        super(message);

        const invalidInnerErrors = innerErrors.filter((error) => !isError(error));

        if (invalidInnerErrors.length)
            throw new Error(
                `One or more of the inner errors provided is not an error: ${JSON.stringify(
                    invalidInnerErrors
                )}`
            );

        this.innerErrors = [...innerErrors];
    }
}
