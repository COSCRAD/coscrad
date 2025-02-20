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

    let _contributorRepository: IRepositoryForAggregate<CoscradContributor>;

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
        _contributorRepository = new ArangoRepositoryForAggregate(
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

    const _testContributors = contributorIdsAndNames.map(({ contributorId, fullName }) =>
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
});
