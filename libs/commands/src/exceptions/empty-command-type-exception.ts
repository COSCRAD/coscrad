export class EmptyCommandTypeException extends Error {
    constructor() {
        super(`Command type must be a non-empty string`);
    }
}
