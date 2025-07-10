import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { TestEventStream } from '../../../../test-data/events';
import { buildTestInstance } from '../../../../test-data/utilities';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CoscradContributor } from '../../user-management';
import { TagCreated } from '../commands/create-tag/tag-created.event';
import { ArangoTagQueryRepository } from './arango-tag-query-repository';
import { ITagQueryRepository } from './tag-query-repository.interface';

const tagIds = [1, 2, 3].map(buildDummyUuid);

const contributorIds = [111, 121, 131].map(buildDummyUuid);

const _testContributors = contributorIds.map((id, index) => {
    buildTestInstance(CoscradContributor, {
        id,
        fullName: {
            firstName: 'Contributor',
            lastName: `Number-${index + 111}`,
        },
    });
});

describe(`ArangoTagQueryRepository`, () => {
    let testQueryRepository: ITagQueryRepository;

    let connectionProvider: ArangoConnectionProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    // let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
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

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoTagQueryRepository(connectionProvider);

        // contributorRepository = new ArangoRepositoryForAggregate(
        //     databaseProvider,
        //     ArangoCollectionId.contributors,
        //     buildInstanceFactory(CoscradContributor),
        //     mapDatabaseDocumentToAggregateDTO,
        //     mapEntityDTOToDatabaseDocument
        // );
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchMany`, () => {
        const tags = tagIds.map((id) => buildTestInstance(TagViewModel, { id }));

        beforeEach(async () => {
            await testQueryRepository.createMany(tags);
        });

        it(`should return the expected tags`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(tags.length);

            const missingTags = tags.filter(({ id }) => !result.some((found) => found.id === id));

            expect(missingTags).toEqual([]);
        });
    });

    describe(`attribute`, () => {
        const targetTag = buildTestInstance(TagViewModel, {
            id: tagIds[0],
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await databaseProvider.getDatabaseForCollection('contributors').clear();

            await testQueryRepository.create(targetTag);

            // await contributorRepository.createMany(testContributors);
        });

        describe(`when there are contributor IDs on the event meta`, () => {
            it(`should add the given contributions`, async () => {
                await testQueryRepository.attribute(
                    targetTag.id,
                    new TestEventStream()
                        .buildSingle<TagCreated>({
                            type: 'TAG_CREATED',
                            meta: { contributorIds },
                        })
                        .buildContributionSummary()
                );

                const _updatedView = (await testQueryRepository.fetchById(
                    targetTag.id
                )) as TagViewModel;
            });
        });
    });
});
