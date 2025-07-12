import { Type } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Ack } from '../constants';
import { CommandMetadataBase } from '../decorators/types/CommandMetadataBase';
import { NoCommandHandlerRegisteredForCommandException } from '../exceptions';
import { CommandWithGivenTypeNotFoundException } from '../exceptions/command-with-given-type-not-found-exception';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';
import { FluxStandardAction } from '../interfaces/flux-standard-action.interface';
import getCommandFromHandlerMetadata from './utilities/getCommandFromHandlerMetadata';
import getCommandMetadata from './utilities/getCommandMetadata';
import getCommandTypeFromMetadata from './utilities/getCommandTypeFromMetadata';

export type CommandConstructorAndMeta<TCommandMeta extends CommandMetadataBase> = {
    constructor: Type<ICommand>;
    meta: TCommandMeta;
};

type CommandResult = Error | Ack;

type BulkCommandExecutionResult = {
    fsa: FluxStandardAction & { meta?: Record<string, unknown> };
    result: CommandResult;
};

export class CommandHandlerService {
    #handlers: Map<string, ICommandHandler> = new Map();

    registerHandler(type: string, handler: ICommandHandler) {
        this.#handlers.set(type, handler);
    }

    async execute(
        { type, payload }: FluxStandardAction,
        /**
         * TODO We should use a data class and schema validation for metadata.
         */
        meta?: Record<string, unknown>
    ): Promise<CommandResult> {
        const handler = this.#handlers.get(type);

        if (!handler) throw new NoCommandHandlerRegisteredForCommandException(type);

        const commandInstance = this.#buildCommand({ type, payload });

        return handler.execute(commandInstance, type, meta);
    }

    async executeStream(
        commandFsas: (FluxStandardAction & { meta?: Record<string, unknown> })[]
    ): Promise<BulkCommandExecutionResult[]> {
        const allResults: BulkCommandExecutionResult[] = [];

        for (const fsa of commandFsas) {
            // TODO combine meta into the FSA in `execute`
            const result = await this.execute(fsa, fsa.meta);

            if (result !== Ack) {
                const e = new Error(
                    // note that we have yet to push, so the current length will become the index for this command result
                    `Failed at command [${allResults.length}] (${
                        fsa.type
                    }). \n ${result.toString()}`
                );

                allResults.push({
                    fsa,
                    result: e,
                });
            } else {
                allResults.push({ fsa, result: Ack });
            }
        }

        return allResults;
    }

    #buildCommand({ type, payload }: FluxStandardAction): ICommand {
        const commandCtor = this.#getCommandCtorFromCommandType(type);

        const instanceToValidate = plainToInstance(commandCtor, payload);

        return instanceToValidate;
    }

    getAllCommandCtorsAndMetadata<
        TCommandMeta extends CommandMetadataBase
    >(): CommandConstructorAndMeta<TCommandMeta>[] {
        const allCtors = this.#getAllCommandCtors();

        return allCtors.map((ctor) => ({
            meta: getCommandMetadata(ctor),
            constructor: ctor,
        }));
    }

    #getAllCommandCtors() {
        const allHandlers = [...this.#handlers.values()];

        return allHandlers
            .map((handler) => Object.getPrototypeOf(handler).constructor)
            .map((handlerCtor) => getCommandFromHandlerMetadata(handlerCtor));
    }

    #getCommandCtorFromCommandType(type: string): Type<ICommand> {
        const allCommandCtors = this.#getAllCommandCtors();

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
