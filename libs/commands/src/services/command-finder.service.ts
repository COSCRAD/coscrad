import { Injectable, Type } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { COMMAND_HANDLER_METADATA } from '../decorators/constants';
import { CommandHandlerMetadata } from '../decorators/types/CommandHandlerMetadata';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';
import getCommandFromHandlerMetadata from './utilities/getCommandFromHandlerMetadata';

type CommandAndHandlerPair = [Type<ICommand>, ICommandHandler];

@Injectable()
export class CommandFinderService {
    constructor(
        private readonly modulesContainer: ModulesContainer,
        private reflector: Reflector
    ) {}

    async find(): Promise<CommandAndHandlerPair[]> {
        const commandHandlerCtorsAndMeta: [ICommandHandler, Type<ICommandHandler>][] = [];

        for (const moduleInstance of this.modulesContainer.values()) {
            for (const wrapper of moduleInstance.providers.values()) {
                const ctor = wrapper.metatype;

                if (!ctor) {
                    continue;
                }

                const metadata = this.reflector.get<CommandHandlerMetadata>(
                    COMMAND_HANDLER_METADATA,
                    ctor
                );

                if (!metadata) {
                    continue;
                }

                commandHandlerCtorsAndMeta.push([
                    wrapper.instance as ICommandHandler,
                    ctor as Type<ICommandHandler>,
                ]);
            }
        }

        const commandAndHandlerPairs = commandHandlerCtorsAndMeta.map(([instance, ctor]) => [
            getCommandFromHandlerMetadata(ctor),
            instance,
        ]) as CommandAndHandlerPair[];

        return commandAndHandlerPairs;
    }
}
