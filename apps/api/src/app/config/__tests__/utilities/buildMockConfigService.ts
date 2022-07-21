import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { DTO } from '../../../../types/DTO';
import { EnvironmentVariables } from '../../env.validation';

type ConfigOverrides = Partial<DTO<EnvironmentVariables>>;

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
