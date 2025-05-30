import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ArangoCollectionId } from '../../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryProvider } from '../../../../../persistence/repositories/arango-repository.provider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { CoscradContributor } from '../entities';
import { ICoscradContributorRepository } from '../interfaces';

const sequentialIds = [1, 2, 3];

const testIds = sequentialIds.map(buildDummyUuid);

const testContributors = testIds.map((id) =>
    buildTestInstance(CoscradContributor, {
        id,
        shortBio: `This is the test contributor with id: ${id}. They are a figment of some developer's imagination and live in the village of Penny.`,
    })
);

const _validationResults = testContributors.map((c) => c.validateInvariants());

describe(`ArangoContributorRepository`, () => {
    let testRepository: ICoscradContributorRepository;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        const app = testModule.createNestApplication();

        await app.init();

        testRepository = app
            .get<ArangoRepositoryProvider>(REPOSITORY_PROVIDER_TOKEN)
            .getContributorRepository();

        databaseProvider = app.get(ArangoDatabaseProvider);
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection(ArangoCollectionId.contributors).clear();
    });

    describe(`fetch multiple by ID`, () => {
        describe(`when a contributor exists with every ID`, () => {
            beforeEach(async () => {
                // for this case, we put all contributors in the database
                await testRepository.createMany(testContributors);
            });

            it(`should return the contributors`, async () => {
                const result = await testRepository.fetchMultipleById(testIds);

                expect(result).toHaveLength(testContributors.length);
            });
        });

        describe(`when some (2/3) of the contributors exist with the given ID`, () => {
            const missingContributorId = testIds[0];

            beforeEach(async () => {
                await testRepository.createMany(
                    testContributors.filter(({ id }) => id !== missingContributorId)
                );
            });

            it(`should return the contributors that exist only`, async () => {
                const result = await testRepository.fetchMultipleById(testIds);

                expect(result).toHaveLength(2);
            });
        });

        describe(`when none of the contributors exist`, () => {
            // No contributors are added in a `beforeEach` in this case

            it(`should return an empty list`, async () => {
                const result = await testRepository.fetchMultipleById(testIds);

                expect(result).toEqual([]);
            });
        });
    });
});
