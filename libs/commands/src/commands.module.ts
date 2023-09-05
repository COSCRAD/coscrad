import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { EmptyCommandTypeException } from './exceptions/empty-command-type-exception';
import { CommandFinderService, CommandHandlerService } from './services';
import getCommandTypeFromMetadata from './services/utilities/getCommandTypeFromMetadata';

@Module({
    providers: [CommandHandlerService, CommandFinderService],
    imports: [DiscoveryModule],
    exports: [CommandHandlerService],
})
export class CommandModule implements OnApplicationBootstrap {
    constructor(
        private readonly finderService: CommandFinderService,
        private readonly commandHanlderService: CommandHandlerService
    ) {}

    async onApplicationBootstrap() {
        const commandAndHandlerPairs = await this.finderService.find();

        commandAndHandlerPairs.forEach(([Command, CommandHandler]) => {
            const type = getCommandTypeFromMetadata(Command);

            if (type === null || typeof type === 'undefined') {
                throw new EmptyCommandTypeException();
            }

            this.commandHanlderService.registerHandler(type, CommandHandler);
        });
    }
}
