export class CommandWithGivenTypeNotFoundException extends Error {
    constructor(type: string) {
        super(`No command with type: ${type} was found.`);
    }
}
