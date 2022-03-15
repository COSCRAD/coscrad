import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../config/buildConfigFilePath';
import { validate } from '../config/env.validation';
import { buildAllCustomEnvironmentVariableKeys } from './__tests__/utilities/buildAllEnvironmentVariableKeys';
import removeAllCustomEntironmentVariables from './__tests__/utilities/removeAllCustomEnvironmentVariables';

const originalEnv = process.env;

/**
 * The purpose of the base '/' endpoint is to give us a sanity check that the
 * server is up and running properly. The purpose of this test is to give some
 * guidance in how to setup more complex e2e tests of our api.
 */

const createAppModule = (configFileName: string) =>
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

  describe('the environment', () => {
    it('should be test', () => {
      expect(process.env.NODE_ENV).toBe('test');
    });
  });

  describe('when all environment variables are valid', () => {
    describe('the config service', () => {
      describe('when creating the module', () => {
        it('should not throw', () => {
          const attemptToCreateAppModule = () => createAppModule('sample');

          expect(attemptToCreateAppModule).not.toThrow();
        });
      });
      describe('when reading environment variables', () => {
        beforeAll(async () => {
          const moduleRef = await createAppModule('sample');

          app = moduleRef.createNestApplication();
          await app.init();
        });

        it('should obtain the correct values', () => {
          const configService = app.get(ConfigService);

          const config = buildAllCustomEnvironmentVariableKeys().reduce(
            (accumulated, key) => ({
              ...accumulated,
              [key]: configService.get(key),
            }),
            {}
          );

          expect(config).toMatchSnapshot();
        });
      });
    });
  });

  describe('when the .env contains invalid variable declarations', () => {
    const attemptToCreateAppModule = () => createAppModule('invalid');

    // We might want to check that the promise rejects here instead
    it('should throw', () => {
      expect(attemptToCreateAppModule).toThrow();

      let configErrorMessage;

      try {
        attemptToCreateAppModule();
      } catch (error) {
        configErrorMessage = error;
      }

      expect(configErrorMessage).toMatchSnapshot();
    });
  });

  describe('when NODE_ENV is not inherited from the process', () => {
    beforeAll(() => {
      delete process.env.NODE_ENV;
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    const attemptToCreateAppModule = () => createAppModule('sample');

    // We might want to check that the promise rejects here instead
    it('should throw', () => {
      expect(attemptToCreateAppModule).toThrow();

      let configErrorMessage;

      try {
        attemptToCreateAppModule();
      } catch (error) {
        configErrorMessage = error;
      }

      expect(configErrorMessage).toMatchSnapshot();
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(async () => {
    await app.close();
  });
});
