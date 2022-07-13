export class FailedToGenerateFuzzForUnsupportedDataTypeException extends Error {
    constructor(type: string) {
        super(`Failed to generate fuzz for unsupported data type: ${type}`);
    }
}
