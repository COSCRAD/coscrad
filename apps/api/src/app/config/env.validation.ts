import {
    ExternalEnum,
    getCoscradDataSchema,
    NonEmptyString,
    PositiveInteger,
    String,
    URL,
    validateCoscradModelInstance,
} from '@coscrad/data-types';
import { plainToInstance } from 'class-transformer';
import { Environment } from './constants/Environment';
import { Scheme } from './constants/Scheme';

export class EnvironmentVariables {
    @ExternalEnum(
        {
            enumLabel: 'Node Environment',
            enumName: `Environment`,
            labelsAndValues: Object.values(Environment).map((envName) => ({
                label: envName,
                value: envName,
            })),
        },
        {
            label: 'Node Environment',
            description: 'is the server running in production, staging, testing?',
        }
    )
    NODE_ENV: Environment;

    @PositiveInteger({
        label: 'Node Port',
        description: 'the port on which Node (Express) will listen for requests',
    })
    NODE_PORT: number;

    // TODO[https://www.pivotaltracker.com/story/show/181530113] tighten up these rules with custom validators
    @String({
        label: 'Arango DB host scheme',
        description: 'http or https?',
    })
    ARANGO_DB_HOST_SCHEME: Scheme;

    @String({
        label: 'Arango DB host domain',
        description: "the domain part of Arango's rest endpoint",
    })
    ARANGO_DB_HOST_DOMAIN: string;

    @PositiveInteger({
        label: 'Arango Port',
        description: "the port Arango's rest server is listening on",
    })
    ARANGO_DB_HOST_PORT: number;

    @NonEmptyString({
        label: 'Arango DB root password',
        description: 'the password for the root user of your Arango instance',
    })
    ARANGO_DB_ROOT_PASSWORD: string;

    @NonEmptyString({
        label: 'Arango DB username',
        description: 'the username for the non-root system user of your Arango instance',
    })
    ARANGO_DB_USER: string;

    @NonEmptyString({
        label: 'Arango DB user password',
        description: 'the password for the non-root system user of your Arango instance',
    })
    ARANGO_DB_USER_PASSWORD: string;

    @NonEmptyString({
        label: 'Arango DB name',
        description: 'the name of the database your application will connect to',
    })
    ARANGO_DB_NAME: string;

    @URL({
        label: 'Auth0 Issuer URL',
        description: 'the issuer URL from Auth0',
    })
    AUTH0_ISSUER_URL: string;

    @URL({
        label: 'Auth0 Audience',
        description: 'the audience of the Auth0 App',
    })
    AUTH0_AUDIENCE: string;

    @URL({
        label: 'Base Digital Asset URL',
        description: 'some media hyperlinks are dynamically constructed and use this prefix',
    })
    BASE_DIGITAL_ASSET_URL: string;

    @NonEmptyString({
        label: 'Global API Prefix',
        description: 'the prefix that will come before all endpoints in your API',
    })
    GLOBAL_PREFIX: string;
}

export const validate = (config: Record<string, unknown>): EnvironmentVariables => {
    const configToValidate = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });

    const errors = validateCoscradModelInstance(
        getCoscradDataSchema(EnvironmentVariables),
        configToValidate,
        {
            forbidUnknownValues: false,
        }
    );

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return configToValidate;
};
