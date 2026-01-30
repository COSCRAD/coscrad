import { existsSync } from 'fs';
import { Environment } from './constants/environment';

const getTargetDirectoryForEnvironment = (environment: Environment): string => {
    if ([Environment.production, Environment.staging, Environment.e2e].includes(environment))
        return '/';

    return `/apps/api/src/app/config/`;
};

/**
 * It is the responsibility of the client to validate the environment prefix.
 */
export default (envFilePrefix: string): string => {
    // TODO We may want to throw here to fail faster when an invalid env is used

    /**
     * `envFilePrefix` is usually linked to node_env and of type `Environment`,
     * but we override this in some tests to use dummy filenames. For that reason,
     * we assume only that this is a string.
     */
    const baseDir = getTargetDirectoryForEnvironment(envFilePrefix as Environment);

    const path = `${process.cwd()}${baseDir}${envFilePrefix}.env`;

    if (!existsSync(path)) {
        console.warn(`Warning: Expected to find a .env file at: ${path}`);

        /**
         * We don't want to throw here. We **could** return not found
         * and let the client explicitly decide what to do. But it's important
         * for usability that the system fall back to existing environment variables
         * if no `.env` file is provided.
         */
        return undefined;
    }
    return path;
};
