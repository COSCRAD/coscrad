import { Injectable } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import { COMMAND_HANDLER_METADATA } from './decorators/CommandHandler.decorator';
import { ICommandHandler } from './ICommandHandler';

@Injectable()
export class CommandFinderService {
    constructor(private readonly modulesContainer: ModulesContainer) {}

    explore(): ICommandHandler[] {
        const modules = [...this.modulesContainer.values()];

        const result = modules
            .map((module) => [...module.providers.values()])
            .reduce((a, b) => a.concat(b), [])
            .filter((element) => !!element)
            .map(({ instance }) => instance)
            .filter((instance) => !!instance)
            .filter((instance) => !!instance.constructor)
            .map((instance) => instance.constructor)
            .map((constructor) => Reflect.getMetadata(COMMAND_HANDLER_METADATA, constructor))
            .filter((meta) => !!meta);

        console.log({
            foundCommandHandlers: result,
        });

        return result;
    }
}
