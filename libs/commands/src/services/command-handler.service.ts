import { Ack } from '../constants';
import { NoCommandHandlerRegisteredForCommandException } from '../exceptions';
import { CommandWithGivenTypeNotFoundException } from '../exceptions/command-with-given-type-not-found-exception';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';
import { FluxStandardAction } from '../interfaces/flux-standard-action.interface';
import getCommandFromHandlerMetadata from './utilities/getCommandFromHandlerMetadata';
import getCommandTypeFromMetadata from './utilities/getCommandTypeFromMetadata';

export class CommandHandlerService {
    #handlers: Map<string, ICommandHandler> = new Map();

    registerHandler(type: string, handler: new () => ICommandHandler) {
        this.#handlers.set(type, new handler());
    }

    async execute({ type, payload }: FluxStandardAction): Promise<Error | Ack> {
        const command = this.#buildCommand({ type, payload });

        const handler = this.#handlers.get(type);

        if (!handler) throw new NoCommandHandlerRegisteredForCommandException(type);

        return handler.execute(command);
    }

    #buildCommand({ type, payload: commandDTO }: FluxStandardAction): ICommand {
        const allCommandHandlerCtors = [...this.#handlers.values()].map(
            (handler) => Object.getPrototypeOf(handler).constructor
        );

        const allCommandCtors = allCommandHandlerCtors.map((handlerCtor) =>
            getCommandFromHandlerMetadata(handlerCtor)
        );

        const CommandCtor = allCommandCtors.find(
            (commandCtor) => getCommandTypeFromMetadata(commandCtor) === type
        );

        console.log({
            allCommandCtors,
            allCommandHandlerCtors,
            handlers: this.#handlers,
        });

        if (!CommandCtor) {
            // Actually, we need this to be a 400 bad request
            throw new CommandWithGivenTypeNotFoundException(type);
        }

        // TODO Validate command payload

        return new CommandCtor(commandDTO);
    }
}
