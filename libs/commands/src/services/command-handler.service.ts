import { Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
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

    registerHandler(type: string, handler: ICommandHandler) {
        this.#handlers.set(type, handler);
    }

    async execute({ type, payload }: FluxStandardAction): Promise<Error | Ack> {
        const handler = this.#handlers.get(type);

        if (!handler) throw new NoCommandHandlerRegisteredForCommandException(type);

        const commandInstance = this.#buildCommand({ type, payload });

        return handler.execute(commandInstance);
    }

    #buildCommand({ type, payload }: FluxStandardAction): ICommand {
        const commandCtor = this.#getCommandCtorFromCommandType(type);

        const instanceToValidate = plainToInstance(commandCtor, payload);

        return instanceToValidate;
    }

    #getCommandCtorFromCommandType(type: string): Type<ICommand> {
        const allCommandHandlerCtors = [...this.#handlers.values()].map(
            (handler) => Object.getPrototypeOf(handler).constructor
        );

        const allCommandCtors = allCommandHandlerCtors.map((handlerCtor) =>
            getCommandFromHandlerMetadata(handlerCtor)
        );

        const CommandCtor = allCommandCtors.find(
            (commandCtor) => getCommandTypeFromMetadata(commandCtor) === type
        );

        if (!CommandCtor) {
            /**
             * TODO [https://www.pivotaltracker.com/story/show/182365491]
             * This should be bubbled up to the end-user
             */
            throw new CommandWithGivenTypeNotFoundException(type);
        }

        // TODO Validate command payload

        return CommandCtor;
    }
}
