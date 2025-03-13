export enum Environment {
    // Jest tests
    test = 'test',
    // Cypress automated browser tests
    e2e = 'e2e',
    development = 'development',
    production = 'production',
    staging = 'staging',
}

export const isValidEnvironment = (input: string): input is Environment =>
    Object.values(Environment).includes(input as Environment);

const testEnvironments = [Environment.test, Environment.e2e] as const;

type TestEnvironment = typeof testEnvironments[number];

export const isTestEnvironment = (input: unknown): input is TestEnvironment =>
    testEnvironments.includes(input as TestEnvironment);
