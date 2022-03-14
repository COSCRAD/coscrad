import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { entityTypes } from 'apps/api/src/domain/types/entityType';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import TestRepositoryProvider from 'apps/api/src/persistence/repositories/TestRepositoryProvider';
import buildTestData from 'apps/api/src/test-data/buildTestData';
import * as request from 'supertest';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import removeAllCustomEntironmentVariables from '../../config/__tests__/utilities/removeAllCustomEnvironmentVariables';
import httpStatusCodes from '../../constants/httpStatusCodes';
import { EntityViewModelController } from '../entityViewModel.controller';

const originalEnv = process.env;

describe('GET /entities (fetch view models)', () => {
  let app: INestApplication;

  let databaseProvider: DatabaseProvider;

  let testRepositoryProvider: TestRepositoryProvider;

  let configService: ConfigService;

  const testData = buildTestData();

  beforeAll(async () => {
    jest.resetModules();

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
        }),
      ],
      controllers: [EntityViewModelController],
      providers: [
        DatabaseProvider,
        RepositoryProvider,
        ArangoConnectionProvider,
      ],
    }).compile();

    databaseProvider = moduleRef.get<DatabaseProvider>(DatabaseProvider);

    testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

    configService = moduleRef.get<ConfigService>(ConfigService);

    app = moduleRef.createNestApplication();
    await app.init();

    await testRepositoryProvider.testSetup();

    await testRepositoryProvider.addEntitiesOfManyTypes(testData);
  });

  describe(`when entity type is omitted`, () => {
    it('should return a 400', () =>
      request(app.getHttpServer()).get(`/entities`).expect(400));
  });

  Object.values(entityTypes).forEach((entityType) => {
    describe(`?type=${entityType} (fetching many view models)`, () => {
      it(`should fetch multiple entities of type ${entityType}`, () => {
        return request(app.getHttpServer())
          .get(`/entities`)
          .query({
            type: entityType,
          })
          .expect(httpStatusCodes.ok);
        /**
         * TODO
         * - Snapshot the response
         * - Specifically test `published` flag works here
         */
      });
    });

    describe(`?type=${entityType} when an id is provided`, () => {
      describe('when no entity with that id exists', () => {
        it(`should return not found`, () => {
          return request(app.getHttpServer())
            .get(`/entities`)
            .query({
              type: entityType,
              id: 'bogus-id',
            })
            .expect(httpStatusCodes.notFound);
        });
      });

      describe('when an entity with that id is found', () => {
        it('should return a valid response', () => {
          return request(app.getHttpServer())
            .get(`/entities`)
            .query({
              type: entityType,
              id: testData[entityType][0].id,
            })
            .expect(httpStatusCodes.ok);
        });
      });
    });
  });

  afterAll(async () => {
    await testRepositoryProvider.testTeardown();

    await app.close();

    process.env = originalEnv;
  });
});
