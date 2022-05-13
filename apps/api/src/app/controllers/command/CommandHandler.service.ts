import { InternalError } from '../../../lib/errors/InternalError';
import { ResultOrError } from '../../../types/ResultOrError';
import { ICommand } from './ICommand';
import { ICommandHandler, Ok } from './ICommandHandler';

export default class CommandHandlerService {
    #handlers: Map<string, ICommandHandler>;

    registerHandler(handler: ICommandHandler) {
        const { type } = handler;

        this.#handlers.set(type, handler);
    }

    execute(command: ICommand): ResultOrError<Ok> {
        const { type } = command;

        const handler = this.#handlers.get(type);

        if (!handler)
            throw new InternalError(`There is no handler registered for the command: ${type}`);

        return handler.execute(command);
    }
}
