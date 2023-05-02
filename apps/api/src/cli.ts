import { CommandFactory } from 'nest-commander';
import { CoscradCliModule } from './coscrad-cli/coscrad-cli.module';

async function bootstrapCli() {
    console.log('will run command');

    await CommandFactory.run(CoscradCliModule);
}

bootstrapCli();
