import { ICommand } from './command.interface';

export interface FluxStandardAction<T extends ICommand = {}> {
    type: string;
    payload: T;
}
