export const isError = (input: unknown): input is Error => input instanceof Error;

export const isInternalError = (input: unknown): input is InternalError =>
    input instanceof InternalError;

export class InternalError extends Error {
    innerErrors: InternalError[] = [];

    constructor(message: string, innerErrors: InternalError[] = []) {
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

    toString(): string {
        return [
            this.message,
            this.innerErrors.length > 0
                ? `Inner Errors: ${this.#buildMessageForInnerErrors()}`
                : '',
        ].join('\n');
    }

    #buildMessageForInnerErrors(): string {
        return this.innerErrors.reduce(
            (message, innerError) =>
                message + innerError.innerErrors
                    ? innerError.innerErrors.toString()
                    : innerError.message,
            ''
        );
    }
}
