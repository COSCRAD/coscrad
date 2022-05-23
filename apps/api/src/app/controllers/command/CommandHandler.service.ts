import { InternalError } from '../../../lib/errors/InternalError';
import { ResultOrError } from '../../../types/ResultOrError';
import { ICommand } from './ICommand';
import { ICommandHandler } from './ICommandHandler';

export default class CommandHandlerService {
    #handlers: Map<string, ICommandHandler> = new Map();

    registerHandler(type, handler: ICommandHandler) {
        console.log(`Registering command handler with type:${type}, handler: ${handler}`);

        // @ts-expect-error fix types soon
        this.#handlers.set(type, new handler());
    }

    async execute(command: ICommand): Promise<ResultOrError<string>> {
        const { type } = command;

        const handler = this.#handlers.get(type);

        if (!handler)
            throw new InternalError(`There is no handler registered for the command: ${type}`);

        return handler.execute(command);
    }
}
