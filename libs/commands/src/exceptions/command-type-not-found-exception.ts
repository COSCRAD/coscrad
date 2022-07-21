import { ICommand } from '../interfaces/command.interface';

export class CommandTypeNotFoundException extends Error {
    constructor(command: ICommand) {
        super(`No type metadata found for the command: ${JSON.stringify(command)}`);
    }
}
