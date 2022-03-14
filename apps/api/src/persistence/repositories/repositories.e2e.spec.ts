import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/Environment';
import removeAllCustomEntironmentVariables from '../../app/config/__tests__/utilities/removeAllCustomEnvironmentVariables';
import getInstanceFactoryForEntity from '../../domain/factories/getInstanceFactoryForEntity';
import { Entity } from '../../domain/models/entity';
import { entityTypes, InMemorySnapshot } from '../../domain/types/entityType';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { NotFound } from '../../lib/types/not-found';
import buildTestData from '../../test-data/buildTestData';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import { DatabaseProvider } from '../database/database.provider';
import TestRepositoryProvider from './TestRepositoryProvider';

const originalEnv = process.env;

describe('Repository provider > repositoryForEntity', () => {
  let testData: InMemorySnapshot;

  let databaseProvider: DatabaseProvider;

  let testRepositoryProvider: TestRepositoryProvider;

  let configService: ConfigService;

  beforeEach(async () => {
    jest.resetModules();

    removeAllCustomEntironmentVariables();

    testData = buildTestData();

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: buildConfigFilePath(Environment.test),
          cache: false,
        }),
      ],
      providers: [DatabaseProvider, ArangoConnectionProvider],
    }).compile();

    databaseProvider = moduleRef.get<DatabaseProvider>(DatabaseProvider);

    testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

    configService = moduleRef.get<ConfigService>(ConfigService);

    await testRepositoryProvider.testSetup();
  });

  afterEach(async () => {
    process.env = originalEnv;

    await testRepositoryProvider.testTeardown();
  });

  describe('the configuration', () => {
    it('should use the correct database', () => {
      expect(configService.get('ARANGO_DB_NAME')).toEqual('e2etestdb');
    });
  });

  Object.values(entityTypes).forEach((entityType) => {
    describe(`Repository for entity of type ${entityType}`, () => {
      beforeEach(async () => {
        await testRepositoryProvider.addEntitiesOfManyTypes(testData);
      });
      describe('fetchMany', () => {
        it('should return the expected result', async () => {
          const result = await testRepositoryProvider
            .forEntity(entityType)
            .fetchMany();

          /**
           * TODO [https://www.pivotaltracker.com/story/show/181503421] setup a
           * custom matcher in Jest for comparing instances (not DTOs)
           * */
          expect(JSON.stringify(result)).toEqual(
            JSON.stringify(testData[entityType])
          );
        });
      });

      describe('fetchById', () => {
        describe('when there is an entity with the given id', () => {
          it('should return the expected result', async () => {
            const entityToFind = testData[entityType][0];

            const result = await testRepositoryProvider
              .forEntity(entityType)
              .fetchById(entityToFind.id);

            // TODO custom matcher (Same as above)
            expect(JSON.stringify(result)).toEqual(
              JSON.stringify(entityToFind)
            );
          });
        });

        describe('when there is no entity with the given id', () => {
          it('should return not found', async () => {
            const result = await testRepositoryProvider
              .forEntity(entityType)
              .fetchById('BOGUS-ENTITY-ID');

            // TODO custom matcher (Same as above)
            expect(result).toEqual(NotFound);
          });
        });
      });

      describe('getCount', () => {
        it('should return the expected count', async () => {
          const expectedCount = testData[entityType].length;

          const actualCount = await testRepositoryProvider
            .forEntity(entityType)
            .getCount();

          expect(actualCount).toEqual(expectedCount);
        });
      });

      describe('create', () => {
        it('should successfully create the new entity', async () => {
          const dtoForEntityToCreate = {
            ...testData[entityType][0].toDTO(),
            id: 'BRAND-NEW-ENTITY-ID',
          };

          const entityFactory = getInstanceFactoryForEntity(entityType);

          const newEntityInstance = entityFactory(dtoForEntityToCreate);

          /**
           * This is just to satisfy the typeScript compiler. It shouldn't happen,
           * as we already pass our test data through the validators as part of
           * a separate test.
           */
          if (isInternalError(newEntityInstance)) throw newEntityInstance;

          await testRepositoryProvider
            .forEntity(entityType)
            .create(newEntityInstance);

          const entityFetchedAfterCreation = await testRepositoryProvider
            .forEntity(entityType)
            .fetchById(newEntityInstance.id);

          expect(entityFetchedAfterCreation).not.toBe(NotFound);

          expect(JSON.stringify(entityFetchedAfterCreation)).toEqual(
            JSON.stringify(newEntityInstance)
          );
        });
      });

      describe('createMany', () => {
        it('should successfully create all new entities', async () => {
          const entityFactory = getInstanceFactoryForEntity(entityType);

          const newEntitiesToCreateOrErrors = testData[entityType]
            .map((oldEntity, index) => ({
              ...oldEntity.toDTO(),
              id: `NEW-ENTITY-ID-${index + 1}`,
            }))
            .map((dto) => entityFactory(dto));

          /**
           * **note** This shouldn't happen as we already test that our test
           * data satisfies invariant validation and we are only changing the
           * id here (so to avoid collisions in the db).
           */
          if (newEntitiesToCreateOrErrors.some(isInternalError))
            throw new InternalError(
              [
                `Encountered invalid test data for entity of type: ${entityType}.`,
                `\n You may want to run validateTestData.spec.ts`,
              ].join(' ')
            );

          /**
           * This is solely to quiet typeCheck without casting, as we've
           * already thrown if any validation errors were returned from the
           * factory.
           */
          const newEntitiesToCreate = newEntitiesToCreateOrErrors.filter(
            (entityOrError): entityOrError is Entity =>
              !isInternalError(entityOrError)
          );

          await testRepositoryProvider
            .forEntity(entityType)
            .createMany(newEntitiesToCreate);

          newEntitiesToCreate.forEach(async (entity) => {
            const entityFetchedAfterCreation = await testRepositoryProvider
              .forEntity(entityType)
              .fetchById(entity.id);

            expect(entityFetchedAfterCreation).not.toBe(NotFound);

            expect(JSON.stringify(entityFetchedAfterCreation)).toEqual(
              JSON.stringify(entity)
            );
          });
        });
      });
    });
  });
});
