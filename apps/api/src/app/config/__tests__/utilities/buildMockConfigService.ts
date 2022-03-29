import { PartialDTO } from 'apps/api/src/types/partial-dto';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { EnvironmentVariables } from '../../env.validation';

type ConfigOverrides = PartialDTO<EnvironmentVariables>;

export default (configOverrides: ConfigOverrides, envFilePath: string) => {
    const realConfig = dotenv.parse(fs.readFileSync(envFilePath));

    const mockedConfig = {
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
