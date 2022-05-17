import { ResultOrError } from '../../../types/ResultOrError';
import { ICommand } from './ICommand';

export const Ok = Symbol('ok');

export type Ok = typeof Ok;

export interface ICommandHandler {
    execute(command: ICommand): Promise<ResultOrError<Ok>>;
}
