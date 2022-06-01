import { Ack } from '../constants';
import { COMMAND_METADATA } from '../decorators/constants';
import { CommandMetadata } from '../decorators/types/CommandMetadata';
import { NoCommandHandlerRegisteredForCommandException } from '../exceptions';
import { CommandTypeNotFoundException } from '../exceptions/command-type-not-found-exception';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';

export class CommandHandlerService {
    #handlers: Map<string, ICommandHandler> = new Map();

    registerHandler(type: string, handler: new () => ICommandHandler) {
        this.#handlers.set(type, new handler());
    }

    async execute(command: ICommand): Promise<Error | Ack> {
        const commandPrototype = Object.getPrototypeOf(command);

        const { type } = Reflect.getMetadata(
            COMMAND_METADATA,
            commandPrototype.constructor
        ) as CommandMetadata;

        if (typeof type !== 'string' || type === '') {
            throw new CommandTypeNotFoundException(command);
        }

        const handler = this.#handlers.get(type);

        if (!handler) throw new NoCommandHandlerRegisteredForCommandException(type);

        return handler.execute(command);
    }
}
