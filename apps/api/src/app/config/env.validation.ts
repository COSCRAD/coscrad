import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

export enum Environment {
  test = 'test',
  development = 'development',
  production = 'production',
}

export enum Scheme {
  http = 'http',
  https = 'https',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  // TODO[https://www.pivotaltracker.com/story/show/181530113] tighten up these rules with custom validators
  @IsNumber()
  NODE_PORT: number;

  // TODO[https://www.pivotaltracker.com/story/show/181530113] tighten up these rules with custom validators
  @IsString()
  ARANGO_DB_HOST_SCHEME: Scheme;

  @IsUrl()
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
}

export const allEnvironmentVariableKeys = [
  'NODE_PORT',
  'ARANGO_DB_HOST_SCHEME',
  'ARANGO_DB_HOST_DOMAIN',
  'ARANGO_DB_HOST_PORT',
  'ARANGO_DB_ROOT_PASSWORD',
  'ARANGO_DB_USER',
  'ARANGO_DB_USER_PASSWORD',
  'ARANGO_DB_NAME',
  'AUTH0_ISSUER_URL',
  'AUTH0_AUDIENCE',
];

export const removeAllCustomEntironmentVariables = (): void =>
  allEnvironmentVariableKeys.forEach((envVar) => {
    if (process.env[envVar]) delete process.env[envVar];
  });

export const validate = (
  config: Record<string, unknown>
): EnvironmentVariables => {
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
