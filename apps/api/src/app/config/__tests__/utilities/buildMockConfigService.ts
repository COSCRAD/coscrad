import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { DTO } from '../../../../types/DTO';
import { EnvironmentVariables } from '../../env.validation';

type ConfigOverrides = Partial<DTO<EnvironmentVariables>>;

export default (configOverrides: ConfigOverrides, envFilePath: string) => {
    const realConfig = dotenv.parse(fs.readFileSync(envFilePath));

    // TODO Fall back to real environment variables in a more extensible way
    const mockedConfig = {
        NODE_PORT: process.env.NODE_PORT,
        ARANGO_DB_HOST_SCHEME: process.env.ARANGO_DB_HOST_SCHEME,
        ARANGO_DB_HOST_DOMAIN: process.env.ARANGO_DB_HOST_DOMAIN,
        ARANGO_DB_HOST_PORT: process.env.ARANGO_DB_HOST_PORT,
        ARANGO_DB_ROOT_PASSWORD: process.env.ARANGO_DB_ROOT_PASSWORD,
        ARANGO_DB_USER: process.env.ARANGO_DB_USER,
        ARANGO_DB_USER_PASSWORD: process.env.ARANGO_DB_USER_PASSWORD,
        ARANGO_DB_NAME: process.env.ARANGO_DB_NAME,
        AUTH0_ISSUER_URL: process.env.AUTH0_ISSUER_URL,
        AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE,
        GLOBAL_PREFIX: process.env.GLOBAL_PREFIX,
        ...realConfig,
        ...configOverrides,
    };

    const mockConfigService = {
        get: jest
            .fn()
            .mockImplementation(
                (environmentVariableKey) => mockedConfig[environmentVariableKey] || null
            ),
    };

    return mockConfigService;
};
