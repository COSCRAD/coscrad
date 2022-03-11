import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { EntityType, entityTypes } from 'apps/api/src/domain/types/entityType';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import TestRepositoryProvider from 'apps/api/src/persistence/repositories/TestRepositoryProvider';
import buildTestData from 'apps/api/src/test-data/buildTestData';
import * as request from 'supertest';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { removeAllCustomEntironmentVariables } from '../../config/env.validation';
import { EntityViewModelController } from '../entityViewModel.controller';

const originalEnv = process.env;

const entityType = entityTypes.term;
describe('GET /entities (fetch view models)', () => {
  let app: INestApplication;

  let databaseProvider: DatabaseProvider;

  let testRepositoryProvider: TestRepositoryProvider;

  let configService: ConfigService;

  const testData = buildTestData();

  beforeAll(() => {
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

  beforeEach(async () => {
    jest.resetModules();

    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      ARANGO_DB_NAME: 'e2etestdb',
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: `${process.cwd()}/apps/api/src/app/config/${
            process.env.NODE_ENV
          }.env`,
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

    /**
     * We empty the collections before **and** after each test, just in case.
     */
    const deleteAllDataPromises = Object.keys(testData).map(
      (entityType: EntityType) =>
        testRepositoryProvider.deleteAllEntitiesOfGivenType(entityType)
    );

    await Promise.all(deleteAllDataPromises);

    // Add all test data to the db using the repositories
    const writePromises = Object.entries(testData).map(
      ([entityType, instances]) =>
        testRepositoryProvider
          .forEntity(entityType as EntityType)
          .createMany(instances)
    );

    await Promise.all(writePromises);
  });

  describe(`when entity type is omitted`, () => {
    it('should return a 400', () =>
      request(app.getHttpServer()).get(`/entities`).expect(400));
  });

  describe(`?type=${entityType} (fetching many view models)`, () => {
    it(`should fetch multiple entities of type ${entityType}`, () => {
      return request(app.getHttpServer())
        .get(`/entities`)
        .query({
          type: entityType,
        })
        .expect(200);
      /**
       * TODO
       * - Snapshot the response
       * - Specifically test `published` flag works here
       */
    });

    afterEach(async () => {
      const deleteAllDataPromises = Object.keys(testData).map(
        (entityType: EntityType) =>
          testRepositoryProvider.deleteAllEntitiesOfGivenType(entityType)
      );

      await Promise.all(deleteAllDataPromises);

      process.env = originalEnv;
    });

    afterAll(async () => {
      await app.close();
    });
  });
});
