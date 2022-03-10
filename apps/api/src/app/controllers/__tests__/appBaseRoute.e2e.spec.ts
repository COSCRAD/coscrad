import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppController } from '../../app.controller';
import { AppService } from '../../app.service';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import {
  Environment,
  removeAllCustomEntironmentVariables,
  validate,
} from '../../config/env.validation';

/**
 * The purpose of the base '/' endpoint is to give us a sanity check that the
 * server is up and running properly. The purpose of this test is to give some
 * guidance in how to setup more complex e2e tests of our api.
 */
describe('GET /', () => {
  let app: INestApplication;

  beforeAll(async () => {
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

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: buildConfigFilePath(Environment.test),
          cache: false,
          validate,
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    console.log({
      env: process.env.NODE_ENV,
      db: app.get<ConfigService>(ConfigService).get('ARANGO_DB_NAME'),
    });
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

  it(`should get the welcome message`, () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect(expectedDataInResponse);
  });

  afterAll(async () => {
    await app.close();
  });
});
