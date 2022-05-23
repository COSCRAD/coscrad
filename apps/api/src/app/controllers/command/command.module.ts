import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CommandFinderService } from './CommandFinder.service';
import CommandHandlerService from './CommandHandler.service';

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
        const commandHandlers = await this.finderService.explore();

        console.log({
            commandHandlers,
        });

        commandHandlers.forEach(([Command, CommandHandler]) => {
            console.log(`
            should register command: ${Command} as handled by command handler: ${CommandHandler}`);

            const type = (Command as any).name;

            this.commandHanlderService.registerHandler(type, CommandHandler);
        });
    }
}
