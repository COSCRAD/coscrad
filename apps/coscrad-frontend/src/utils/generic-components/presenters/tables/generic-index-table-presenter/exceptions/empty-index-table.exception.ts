export class EmptyIndexTableException extends Error {
    constructor() {
        super(`You must specify at least one heading when building a table.`);
    }
}
