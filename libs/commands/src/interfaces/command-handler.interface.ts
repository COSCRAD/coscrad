import { Ack } from '../constants';
import { ICommand } from './command.interface';

export interface ICommandHandler {
    execute(command: ICommand, commandType: string): Promise<Ack | Error>;
}
