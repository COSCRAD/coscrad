import { existsSync } from 'fs';
import { InternalError } from '../../lib/errors/InternalError';
import { Environment, isValidEnvironment } from './constants/Environment';

const getTargetDirectoryForEnvironment = (environment: Environment): string => {
    if ([Environment.production, Environment.staging, Environment.e2e].includes(environment))
        return '/';

    return `/apps/api/src/app/config/`;
};

export default (envFilePrefix: string): string => {
    if (!isValidEnvironment(envFilePrefix)) {
        throw new InternalError(
            `Failed to build a .env file path for unsupported environment: ${envFilePrefix}`
        );
    }

    /**
     * `envFilePrefix` is usually linked to node_env and of type `Environment`,
     * but we override this in some tests to use dummy filenames. For that reason,
     * we assume only that this is a string.
     */
    const baseDir = getTargetDirectoryForEnvironment(envFilePrefix as Environment);

    const path = `${process.cwd()}${baseDir}${envFilePrefix}.env`;

    if (!existsSync(path)) {
        throw new InternalError(`Invalid .env file path: ${path}`);
    }
    return path;
};
