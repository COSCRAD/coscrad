import { InternalError } from '../../../lib/errors/InternalError';
import { ResultOrError } from '../../../types/ResultOrError';
import { COMMAND_HANDLER_METADATA } from './decorators/CommandHandler.decorator';
import { ICommand } from './ICommand';
import { ICommandHandler } from './ICommandHandler';

export default class CommandHandlerService {
    #handlers: Map<string, ICommandHandler>;

    registerHandler(handler: ICommandHandler) {
        const type = this.#getCommandType(handler);

        this.#handlers.set(type, handler);
    }

    async execute(command: ICommand): Promise<ResultOrError<string>> {
        const { type } = command;

        const handler = this.#handlers.get(type);

        if (!handler)
            throw new InternalError(`There is no handler registered for the command: ${type}`);

        return handler.execute(command);
    }

    #getCommandType(commandHandler: ICommandHandler): string {
        const { constructor: commandHandlerConstructor } = Object.getPrototypeOf(commandHandler);

        console.log({
            commandHandler,
            commandHandlerConstructor,
        });

        const commandHandlerMetadata = Reflect.getMetadata(
            COMMAND_HANDLER_METADATA,
            commandHandlerConstructor
        );

        if (!commandHandlerMetadata) {
            throw new InternalError(`Command Handler not found`);
        }

        const command = commandHandlerMetadata.command;

        if (!command) {
            throw new InternalError(`Command not found`);
        }

        const { type } = command;

        if (!type) {
            throw new InternalError(`Command type not defined`);
        }

        return type;
    }
}
