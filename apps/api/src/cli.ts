import { CommandFactory } from 'nest-commander';
import { Environment } from './app/config/constants/environment';
import { CoscradCliModule } from './coscrad-cli/coscrad-cli.module';
import { InternalError } from './lib/errors/InternalError';
import { DynamicDataTypeFinderService } from './validation';

async function bootstrapCli() {
    if (!Object.values(Environment).includes(process.env.NODE_ENV as Environment)) {
        throw new Error(`Cannot run COSCRAD CLI in invalid environment: ${process.env.NODE_ENV}`);
    }

    /**
     * In the future, we may want to inject our own logger in the second argument
     * below.
     *
     * Note that we need to bootstrap the dynamic data types (e.g., union COSCRAD
     * data types) before running the app. So we opt out of using `CommandFactory.run(...)`
     * and repeat its logic here, leveraging other static methods thereon.
     */
    const app = await CommandFactory.createWithoutRunning(CoscradCliModule, ['error']);

    // TODO Can we wrap this into `app.init(...)` instead?
    await app.get(DynamicDataTypeFinderService).bootstrapDynamicTypes();

    await CommandFactory.runApplication(app);

    await app.close();
}

bootstrapCli().catch((err) => {
    throw new InternalError(`Failed to bootstrap COSCRAD CLI: ${err}`);
});
