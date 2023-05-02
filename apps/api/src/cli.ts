import { CommandFactory } from 'nest-commander';
import { CoscradCliModule } from './coscrad-cli/coscrad-cli.module';

async function bootstrapCli() {
    await CommandFactory.run(CoscradCliModule);
}

bootstrapCli();
