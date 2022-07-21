import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable, Type } from '@nestjs/common';
import { COMMAND_HANDLER_METADATA } from '../decorators/constants';
import { ICommandHandler } from '../interfaces/command-handler.interface';
import { ICommand } from '../interfaces/command.interface';
import getCommandFromHandlerMetadata from './utilities/getCommandFromHandlerMetadata';

type CommandAndHandlerPair = [Type<ICommand>, ICommandHandler];

@Injectable()
export class CommandFinderService {
    constructor(private readonly discoveryService: DiscoveryService) {}

    async find(): Promise<CommandAndHandlerPair[]> {
        const commandHandlerProviders = await this.discoveryService.providers(
            (provider) =>
                !!provider.injectType &&
                Reflect.hasMetadata(COMMAND_HANDLER_METADATA, provider.injectType)
        );

        const commandAndHandlerPairs = commandHandlerProviders.map((provider) => [
            getCommandFromHandlerMetadata(provider.injectType as Type<ICommandHandler>),
            provider.instance,
        ]) as CommandAndHandlerPair[];

        return commandAndHandlerPairs;
    }
}
