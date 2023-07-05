import { CommandFactory } from 'nest-commander';
import { Environment } from './app/config/constants/Environment';
import { CoscradCliModule } from './coscrad-cli/coscrad-cli.module';
import { InternalError } from './lib/errors/InternalError';

async function bootstrapCli() {
    if (!Object.values(Environment).includes(process.env.NODE_ENV as Environment)) {
        throw new Error(`Cannot run COSCRAD CLI in invalid environment: ${process.env.NODE_ENV}`);
    }

    await CommandFactory.run(CoscradCliModule);
}

bootstrapCli().catch((err) => {
    throw new InternalError(`Failed to bootstrap COSCRAD CLI: ${err}`);
});
