import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../config/buildConfigFilePath';
import {
  allEnvironmentVariableKeys,
  removeAllCustomEntironmentVariables,
  validate,
} from '../config/env.validation';

/**
 * The purpose of the base '/' endpoint is to give us a sanity check that the
 * server is up and running properly. The purpose of this test is to give some
 * guidance in how to setup more complex e2e tests of our api.
 */

const bootstrapApp = (configFileName: string) =>
  Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        /**
         * We intentionally read the sample .env here to avoid snapshotting
         * actual sensitive data. The only constraint is that the values
         * in `sample.env` need to have the corredt types as specified in
         * `env.validation.ts`.
         */
        envFilePath: buildConfigFilePath(configFileName),
        cache: false,
        validate,
      }),
    ],
  }).compile();

describe('ConfigService', () => {
  let app: INestApplication;

  beforeEach(async () => {
    /**
     * HACK We have experienced annoying side-effect issues with the way the
     * built-in ConfigService reads our `.env` files. We have a separate
     * `${environment}.env` file for each unique environment. However,
     * `process.env` apparently takes priority over these locally defined files.
     * Forcing the local values to take precedence in the test environment has
     * been an exercise in frustration.
     *
     * https://github.com/nestjs/config/issues/168
     *
     * https://github.com/nestjs/config/issues/168
     */
    removeAllCustomEntironmentVariables();
  });

  const expectedDataInResponse = {
    message: 'Welcome to the COSCRAD API!',
  };

  describe('the environment', () => {
    it('should be test', () => {
      console.log({
        nodeenv: process.env.NODE_ENV,
      });
      expect(process.env.NODE_ENV).toBe('test');
    });
  });

  describe('when all environment variables are valid', () => {
    beforeAll(async () => {
      const moduleRef = await bootstrapApp('sample');

      app = moduleRef.createNestApplication();
      await app.init();
    });
    it('should set the variables appropriately', () => {
      const configService = app.get(ConfigService);

      const config = allEnvironmentVariableKeys.reduce(
        (accumulated, key) => ({
          ...accumulated,
          [key]: configService.get(key),
        }),
        {}
      );

      expect(config).toMatchSnapshot();
    });
  });

  describe('when the .env contains invalid variable declarations', () => {
    const attemptBootstrap = () => bootstrapApp('invalid');

    it('should throw', () => {
      expect(attemptBootstrap).toThrow();

      let configErrorMessage;

      try {
        attemptBootstrap();
      } catch (error) {
        configErrorMessage = error;
      }

      expect(configErrorMessage).toMatchSnapshot();
    });
  });

  afterEach(() => {
    removeAllCustomEntironmentVariables();
  });

  afterAll(async () => {
    await app.close();
  });
});
