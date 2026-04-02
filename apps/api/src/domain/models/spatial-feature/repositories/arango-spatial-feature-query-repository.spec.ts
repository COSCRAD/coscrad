import { CoscradUserRole, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../coscrad-cli/logging';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import { ISpatialFeatureQueryRepository } from '../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../queries/spatial-feature.view-model.event-sourced';
import { ArangoSpatialFeatureQueryRepository } from './arango-spatial-feature-query-repository';

const testAdminUser = new CoscradUserWithGroups(
    buildTestInstance(CoscradUser, {
        roles: [CoscradUserRole.superAdmin],
    }),
    []
);

describe(`ArangoSpatialFeatureRepository`, () => {
    let testQueryRepository: ISpatialFeatureQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

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

        testQueryRepository = new ArangoSpatialFeatureQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        app.init();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    const spatialFeatureIds = [1, 2, 3].map(buildDummyUuid);

    const buildTextForSpatialFeatureName = (id: string) => `spatial feature ${id}`;

    const spatialFeatureName = buildTextForSpatialFeatureName(spatialFeatureIds[0]);

    const originalLanguageCode = LanguageCode.Chilcotin;

    const spatialFeatureViews: EventSourcedSpatialFeatureViewModel[] = spatialFeatureIds.map((id) =>
        buildTestInstance(EventSourcedSpatialFeatureViewModel, {
            id,
            name: buildMultilingualTextWithSingleItem(
                buildTextForSpatialFeatureName(id),
                originalLanguageCode
            ),
        })
    );

    describe(`fetchById`, () => {
        const targetSpatialFeatureId = spatialFeatureIds[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(spatialFeatureViews[0]);
        });

        describe(`when there is a spatial feature with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(
                    targetSpatialFeatureId,
                    testAdminUser
                );

                expect(result).not.toBe(NotFound);

                const { name } = result as EventSourcedSpatialFeatureViewModel;

                const foundOriginalTextForSpatialFeature = name.items.find(
                    ({ languageCode }) => languageCode === originalLanguageCode
                ).text;

                expect(foundOriginalTextForSpatialFeature).toBe(spatialFeatureName);
            });
        });

        describe(`when there is no spatial feature with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('BOGUS_321');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            for (const view of spatialFeatureViews) {
                await testQueryRepository.create(view);
            }
        });

        it('should return the expected spatial feature views', async () => {
            const { entities: result } = await testQueryRepository.fetchMany({
                user: testAdminUser,
            });

            expect(result).toHaveLength(spatialFeatureIds.length);
        });
    });

    describe(`count`, () => {
        describe(`when there are spatial feature views in the database`, () => {
            beforeEach(async () => {
                await databaseProvider.clearViews();

                for (const spatialFeature of spatialFeatureViews) {
                    await testQueryRepository.create(spatialFeature);
                }
            });

            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(spatialFeatureViews.length);
            });
        });
    });

    describe(`create`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        it(`should create the currect spatial feature view`, async () => {
            const spatialFeatureToCreate = spatialFeatureViews[0];

            await testQueryRepository.create(spatialFeatureToCreate);

            const searchResult = await testQueryRepository.fetchById(
                spatialFeatureToCreate.id,
                testAdminUser
            );

            expect(searchResult).not.toBe(NotFound);

            const foundSpatialFeatureView = searchResult as EventSourcedSpatialFeatureViewModel;

            const name = new MultilingualText(foundSpatialFeatureView.name);

            expect(name.getOriginalTextItem()).toBe(spatialFeatureName);
        });
    });

    // describe(`createNoteAbout`, () => {
    //     const targetSpatialFeature = buildTestInstance(TermViewModel, {
    //         notes: {},
    //     });

    //     const targetNoteText = 'this is a note for the term';

    //     const targetNoteLanguageCode = LanguageCode.English;

    //     const targetNoteMultilingualText = buildMultilingualTextWithSingleItem(
    //         targetNoteText,
    //         targetNoteLanguageCode
    //     );

    //     const targetNote = buildTestInstance(EventSourcedSpatialFeatureViewModel, {});

    //     beforeEach(async () => {
    //         await databaseProvider
    //             .getDatabaseForCollection(ArangoCollectionId.edgeConnectionCollectionID)
    //             .clear();

    //         await databaseProvider.clearViews();

    //         await testQueryRepository.create(targetSpatialFeature);
    //     });
    // });
});
