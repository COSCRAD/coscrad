import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { CommandFinderService } from './CommandFinder.service';
import CommandHandlerService from './CommandHandler.service';

@Module({
    providers: [CommandHandlerService, CommandFinderService],
    exports: [CommandHandlerService],
})
export class CommandModule implements OnApplicationBootstrap {
    constructor(
        private readonly finderService: CommandFinderService,
        private readonly commandHanlderService: CommandHandlerService
    ) {}

    onApplicationBootstrap() {
        const commandHandlers = this.finderService.explore();

        commandHandlers.forEach((handler) => this.commandHanlderService.registerHandler(handler));

        console.log({
            commandHandlerService: JSON.stringify(this.commandHanlderService),
        });
    }
}
