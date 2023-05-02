import { CommandFactory } from 'nest-commander';
import { CoscradCliModule } from './coscrad-cli/coscrad-cli.module';
import { InternalError } from './lib/errors/InternalError';

async function bootstrapCli() {
    await CommandFactory.run(CoscradCliModule);
}

bootstrapCli().catch((err) => {
    throw new InternalError(`Failed to bootstrap COSCRAD CLI: ${err}`);
});
