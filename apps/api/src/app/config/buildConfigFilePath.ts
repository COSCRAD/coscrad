import * as fs from 'fs';
import { InternalError } from '../../lib/errors/InternalError';
import { Environment } from './constants/Environment';

export default (envFilePrefix: string): string => {
    /**
     * `envFilePrefix` is usually linked to node_env and of type `Environment`,
     * but we override this in some tests to use dummy filenames. For that reason,
     * we assume only that this is a string.
     */
    const path = [Environment.production, Environment.staging, Environment.e2e].includes(
        envFilePrefix as Environment
    )
        ? `${process.cwd()}/${envFilePrefix}.env`
        : `${process.cwd()}/apps/api/src/app/config/${envFilePrefix}.env`;

    if (!fs.existsSync(path)) {
        throw new InternalError(`Invalid .env file path: ${path}`);
    }

    return path;
};
