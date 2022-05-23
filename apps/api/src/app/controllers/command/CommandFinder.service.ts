import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { COMMAND_HANDLER_METADATA } from './decorators/CommandHandler.decorator';
import { ICommand } from './ICommand';
import { ICommandHandler } from './ICommandHandler';

type CommandAndHandlerPair = [ICommand, ICommandHandler];

@Injectable()
export class CommandFinderService {
    constructor(private readonly discoveryService: DiscoveryService) {}

    async explore(): Promise<CommandAndHandlerPair[]> {
        const allProviders = await this.discoveryService.providers(
            (x) => x.name === 'TestCommandHandler'
        );

        allProviders.forEach((provider) => {
            console.log({
                aProvider: provider,
                class: provider.injectType,
            });

            if (provider.name === 'TestCommandHandler')
                console.log({
                    commandMeta: Reflect.getMetadata(COMMAND_HANDLER_METADATA, provider.injectType),
                    command: Reflect.getMetadata(COMMAND_HANDLER_METADATA, provider.injectType)
                        .command,
                    handler: provider.injectType,
                });
        });

        const commandAndHandlerPairs = allProviders.map((provider) => [
            Reflect.getMetadata(COMMAND_HANDLER_METADATA, provider.injectType).command,
            provider.injectType,
        ]);
        // hoo
        return commandAndHandlerPairs as CommandAndHandlerPair[];
    }
}
