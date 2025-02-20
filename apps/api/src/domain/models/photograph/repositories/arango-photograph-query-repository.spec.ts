import {
    AggregateType,
    IDetailQueryResult,
    IPhotographViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/Environment';
import { ConsoleCoscradCliLogger } from '../../../../coscrad-cli/logging';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import { PhotographViewModel } from '../../../../queries/buildViewModelForResource/viewModels/photograph.view-model';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradContributor } from '../../user-management/contributor';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import { IPhotographQueryRepository } from '../queries';
import { ArangoPhotographQueryRepository } from './arango-photograph-query-repository';

describe(`ArangoPhotographQueryRepository`, () => {
    let testQueryRepository: IPhotographQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<IPhotographViewModel>
    >;

    let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

    let app: INestApplication;

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

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        arangoDatabaseForCollection =
            databaseProvider.getDatabaseForCollection('photograph__VIEWS');

        testQueryRepository = new ArangoPhotographQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        /**
         * Currently, the contributors are snapshot based (not event sourced).
         */
        contributorRepository = new ArangoRepositoryForAggregate(
            databaseProvider,
            ArangoCollectionId.contributors,
            buildInstanceFactory(CoscradContributor),
            mapDatabaseDocumentToAggregateDTO,
            mapEntityDTOToDatabaseDocument
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    const photographIds = [1, 2, 3].map(buildDummyUuid);

    const buildPhotographTitle = (id: string) => `photograph ${id}`;

    const photographTitle = buildPhotographTitle(photographIds[0]);

    const originalLanguageCode = LanguageCode.Chilcotin;

    const _translationLanguageCode = LanguageCode.English;

    const _textTranslation = 'foobar';

    const dummyPhotographer = 'Tester Photographer';

    const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

    const contributorIds = [101, 102, 103].map(buildDummyUuid);

    const contributorIdsAndNames = contributorIds.map((contributorId) => ({
        contributorId,
        fullName: new FullName({
            firstName: `user`,
            lastName: contributorId,
        }),
    }));

    const testContributors = contributorIdsAndNames.map(({ contributorId, fullName }) =>
        dummyContributor.clone({
            id: contributorId,
            fullName,
        })
    );

    const photographViews: PhotographViewModel[] = photographIds.map((id) =>
        PhotographViewModel.fromDto({
            id,
            contributions: [],
            name: buildMultilingualTextWithSingleItem(
                buildPhotographTitle(id),
                originalLanguageCode
            ),
            photographer: dummyPhotographer,
            actions: [
                'TAG_RESOURCE',
                'CREATE_NOTE_ABOUT_RESOURCE',
                'CONNECT_RESOURCES_WITH_NOTE',
                'PUBLISH_RESOURCE',
                'GRANT_RESOURCE_READ_ACCESS_TO_USER',
            ],
            isPublished: false,
            accessControlList: new AccessControlList(),
        })
    );

    describe(`fetchById`, () => {
        const targetPhotographId = photographIds[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(photographViews[0]);
        });

        describe(`when there is a photograph with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(targetPhotographId);

                expect(result).not.toBe(NotFound);

                const { name } = result as PhotographViewModel;

                const foundOriginalTitleForPhotograph = name.items.find(
                    ({ languageCode }) => languageCode === originalLanguageCode
                ).text;

                expect(foundOriginalTitleForPhotograph).toBe(photographTitle);
            });
        });

        describe(`when there is no photograph with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('BOGUS_123');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            for (const photograph of photographViews) {
                await testQueryRepository.create(photograph);
            }
        });

        it(`should return the expected photograph views`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(photographViews.length);
        });
    });

    describe(`count`, () => {
        describe(`when there are photograph views in the database`, () => {
            beforeEach(async () => {
                await arangoDatabaseForCollection.clear();

                for (const photograph of photographViews) {
                    await testQueryRepository.create(photograph);
                }
            });

            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(photographViews.length);
            });
        });

        describe(`when the database collection is empty`, () => {
            beforeEach(async () => {
                await arangoDatabaseForCollection.clear();

                // no photographs are added here
            });

            it(`should return 0`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(0);
            });
        });
    });

    describe(`allowUser`, () => {
        const targetPhotograph = photographViews[0];

        beforeEach(async () => {
            // clear existing term views
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(targetPhotograph);
        });

        it(`should add the user to the ACL`, async () => {
            const userId = buildDummyUuid(457);

            await testQueryRepository.allowUser(targetPhotograph.id, userId);

            const updatedView = (await testQueryRepository.fetchById(
                targetPhotograph.id
            )) as PhotographViewModel;

            const updatedAcl = new AccessControlList(updatedView.accessControlList);

            const canUser = updatedAcl.canUser(userId);

            expect(canUser).toBe(true);
        });
    });

    describe(`delete`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.createMany(photographViews);
        });

        it(`should remove the given term`, async () => {
            const targetTermViewId = photographIds[0];

            const expectedNumberOfTermsAfterDelete = photographViews.length - 1;

            await testQueryRepository.delete(targetTermViewId);

            const actualNumberOfTerms = await testQueryRepository.count();

            expect(actualNumberOfTerms).toBe(expectedNumberOfTermsAfterDelete);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.createMany(photographViews);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(photographViews.length);
        });
    });

    describe(`create`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the correct term view`, async () => {
            const photographToCreate = photographViews[0];

            // act
            await testQueryRepository.create(photographToCreate);

            const searchResult = await testQueryRepository.fetchById(photographToCreate.id);

            expect(searchResult).not.toBe(NotFound);

            const foundPhotographView = searchResult as PhotographViewModel;

            const name = new MultilingualText(foundPhotographView.name);

            expect(name.getOriginalTextItem().text).toBe(photographTitle);
        });
    });

    describe(`createMany`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the expected term views`, async () => {
            // act
            await testQueryRepository.createMany(photographViews);

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(photographViews.length);
        });
    });

    describe('publish', () => {
        const targetPhotograph = photographViews[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(targetPhotograph);
        });

        it(`should publish the given term`, async () => {
            await testQueryRepository.publish(targetPhotograph.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetPhotograph.id
            )) as PhotographViewModel;

            expect(updatedView.isPublished).toBe(true);

            expect(updatedView.actions).not.toContain('PUBLISH_RESOURCE');
        });
    });

    /**
     * TODO[https://www.pivotaltracker.com/story/show/188764063] support `unpublish`
     */
    describe(`attribute`, () => {
        const targetPhotograph = photographViews[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await databaseProvider.getDatabaseForCollection('contributors').clear();

            await testQueryRepository.create(targetPhotograph);

            await contributorRepository.createMany(testContributors);
        });

        it(`should add the given contributions`, async () => {
            await testQueryRepository.attribute(
                targetPhotograph.id,
                testContributors.map((c) => c.id)
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetPhotograph.id
            )) as PhotographViewModel;

            const missingAttributions = updatedView.contributions.filter(
                ({ id }) => !contributorIds.includes(id)
            );

            expect(missingAttributions).toHaveLength(0);

            const { contributorId: targetContributorId, fullName: expectedFullName } =
                contributorIdsAndNames[0];

            const contributionForFirstUser = updatedView.contributions.find(
                ({ id }) => id === targetContributorId
            );

            expect(contributionForFirstUser.fullName).toBe(
                `${expectedFullName.firstName} ${expectedFullName.lastName}`
            );
        });
    });
});
