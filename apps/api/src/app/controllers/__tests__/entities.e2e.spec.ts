import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import getInstanceFactoryForEntity from 'apps/api/src/domain/factories/getInstanceFactoryForEntity';
import {
  EntityType,
  entityTypes,
  InMemorySnapshot,
} from 'apps/api/src/domain/types/entityType';
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

describe('GET /entities (fetch view models)- all entities published', () => {
  let app: INestApplication;

  let databaseProvider: DatabaseProvider;

  let testRepositoryProvider: TestRepositoryProvider;

  const testData = buildTestData();

  const testDataWithAllEntitiesPublished = Object.entries(testData).reduce(
    (accumulatedData: InMemorySnapshot, [entityType, instances]) => ({
      ...accumulatedData,
      [entityType]: instances.map((instance) =>
        getInstanceFactoryForEntity(entityType as EntityType)({
          ...instance.toDTO(),
          published: true,
        })
      ),
    }),
    {}
  );

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

    app = moduleRef.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await testRepositoryProvider.testSetup();
  });

  describe(`when entity type is omitted`, () => {
    it('should return a 400', () =>
      request(app.getHttpServer()).get(`/entities`).expect(400));
  });

  Object.values(entityTypes).forEach((entityType) => {
    describe(`when querying for view models for entity of type ${entityType}`, () => {
      describe('when an id is not provided', () => {
        describe(`?type=${entityType} (fetching many view models) - all entities published`, () => {
          beforeEach(async () => {
            console.log({
              testDataWithAllEntitiesPublishedForEntity: JSON.stringify(
                testDataWithAllEntitiesPublished[entityType]
              ),
            });

            await testRepositoryProvider.addEntitiesOfManyTypes(
              testDataWithAllEntitiesPublished
            );
          });
          it(`should fetch multiple entities of type ${entityType}`, async () => {
            const res = await request(app.getHttpServer())
              .get(`/entities`)
              .query({
                type: entityType,
              });

            const repoResponse = await testRepositoryProvider
              .forEntity(entityType)
              .fetchMany();

            console.log({
              repoResponse,
            });

            expect(res.status).toBe(httpStatusCodes.ok);

            expect(res.body.length).toBe(
              testDataWithAllEntitiesPublished[entityType].length
            );

            expect(res.body).toMatchSnapshot();
          });
        });
      });

      describe(`?type=${entityType} when an id is provided`, () => {
        describe('when no entity with the id exists', () => {
          beforeEach(async () => {
            await testRepositoryProvider.addEntitiesOfManyTypes(
              testDataWithAllEntitiesPublished
            );
          });
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

        describe('when an entity with the id is found', () => {
          beforeEach(async () => {
            await testRepositoryProvider.addEntitiesOfManyTypes(
              testDataWithAllEntitiesPublished
            );
          });
          it('should return a valid response', async () => {
            const entityToFind =
              testDataWithAllEntitiesPublished[entityType][0];

            const res = await request(app.getHttpServer())
              .get(`/entities`)
              .query({
                type: entityType,
                id: entityToFind.id,
              });

            expect(res.status).toBe(httpStatusCodes.ok);

            expect(res.body.id).toBe(entityToFind.id);
          });
        });
      });
    });

    afterEach(async () => {
      await testRepositoryProvider.testTeardown();
    });
  });

  afterAll(async () => {
    await app.close();

    process.env = originalEnv;
  });
});
