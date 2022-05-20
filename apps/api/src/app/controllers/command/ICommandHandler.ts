import { ICommand } from './ICommand';

export const Ack = 'acknowledgement';

export interface ICommandHandler {
    execute(command: ICommand): Promise<string>;
}
