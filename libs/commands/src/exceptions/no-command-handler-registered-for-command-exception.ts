export class NoCommandHandlerRegisteredForCommandException extends Error {
    constructor(commandType: string) {
        super(
            `There is no handler registered for the command with type: ${commandType}. \nDid you decorate your command handler? \n If so, did you register your command and handler in the relevant domain module?`
        );
    }
}
