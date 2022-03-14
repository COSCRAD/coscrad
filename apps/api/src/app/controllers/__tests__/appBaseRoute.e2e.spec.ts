import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import removeAllCustomEntironmentVariables from '../../../app/config/__tests__/utilities/removeAllCustomEnvironmentVariables';
import { AppController } from '../../app.controller';
import { AppService } from '../../app.service';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import { validate } from '../../config/env.validation';

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
  });

  const expectedDataInResponse = {
    message: 'Welcome to the COSCRAD API!',
  };

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
