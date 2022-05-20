import { Module } from '@nestjs/common';
import { CommandModule } from './command.module';
import { CommandController } from './commands.controller';
import { TestCommandHandler } from './handlers/Test.handler';

@Module({
    imports: [CommandModule],
    controllers: [CommandController],
    providers: [TestCommandHandler],
})
export class TestCommandModule {}
