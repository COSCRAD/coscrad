import { CommandHandler } from '../decorators/CommandHandler.decorator';
import { ICommandHandler } from '../ICommandHandler';
import { TestCommand } from '../Test.command';

@CommandHandler(TestCommand)
export class TestCommandHandler implements ICommandHandler {
    async execute(command: TestCommand) {
        console.log(`You executed: ${command.type}`);
        console.log(`I'm too lazy to care. Have a nice day!`);

        return Promise.resolve('ack');
    }
}
