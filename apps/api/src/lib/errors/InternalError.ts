export const isError = (input: unknown): input is Error => input instanceof Error;

export const isInternalError = (input: unknown): input is InternalError =>
    input instanceof InternalError;

const buildMessageForInnerErrors = (innerErrors?: InternalError[]): string => {
    if (!Array.isArray(innerErrors) || innerErrors.length === 0) return '';

    return innerErrors.reduce(
        (acc, innerError) =>
            acc
                .concat(innerError.message)
                .concat(buildMessageForInnerErrors(innerError.innerErrors)),
        ''
    );
};

export class InternalError extends Error {
    innerErrors: InternalError[] = [];

    constructor(message: string, innerErrors: InternalError[] = []) {
        super(message);

        // TODO we should clone this
        this.innerErrors = innerErrors;
    }

    toString(): string {
        return [
            this.message,
            this.innerErrors.length > 0
                ? `Inner Errors: ${buildMessageForInnerErrors(this.innerErrors)}`
                : '',
        ].join('\n');
    }
}
