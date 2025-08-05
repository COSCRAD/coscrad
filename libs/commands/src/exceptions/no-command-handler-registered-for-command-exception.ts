export class NoCommandHandlerRegisteredForCommandException extends Error {
    constructor(commandType: string) {
        super(
            `There is no handler registered for the command with type: ${commandType}. \nDid you forget the decorator on your command handler?`
        );
    }
}
