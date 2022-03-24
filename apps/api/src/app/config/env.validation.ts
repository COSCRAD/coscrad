import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUrl, validateSync } from 'class-validator';
import { Environment } from './constants/Environment';
import { Scheme } from './constants/Scheme';

export class EnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV: Environment;

    // TODO[https://www.pivotaltracker.com/story/show/181530113] tighten up these rules with custom validators
    @IsNumber()
    NODE_PORT: number;

    // TODO[https://www.pivotaltracker.com/story/show/181530113] tighten up these rules with custom validators
    @IsString()
    ARANGO_DB_HOST_SCHEME: Scheme;

    @IsString()
    ARANGO_DB_HOST_DOMAIN: string;

    @IsNumber()
    ARANGO_DB_HOST_PORT: number;

    // TODO[https://www.pivotaltracker.com/story/show/181530113] Add custom validators
    @IsString()
    @IsNotEmpty()
    ARANGO_DB_ROOT_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    ARANGO_DB_USER: string;

    @IsString()
    @IsNotEmpty()
    ARANGO_DB_USER_PASSWORD: string;

    @IsString()
    @IsNotEmpty()
    ARANGO_DB_NAME: string;

    @IsUrl()
    AUTH0_ISSUER_URL: string;

    @IsString()
    @IsNotEmpty()
    AUTH0_AUDIENCE: string;

    @IsUrl()
    BASE_AUDIO_URL: string;
}

export const validate = (config: Record<string, unknown>): EnvironmentVariables => {
    const configToValidate = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateSync(configToValidate, {
        skipMissingProperties: false,
    });

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return configToValidate;
};
