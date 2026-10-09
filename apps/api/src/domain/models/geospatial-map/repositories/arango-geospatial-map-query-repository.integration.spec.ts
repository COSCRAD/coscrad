import { CoscradUserRole, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import { GeospatialMapModule } from '../../../../app/domain-modules/geospatial-map.module';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { EventSourcedTagViewModel } from '../../../../queries/buildViewModelForResource/viewModels/tag.view-model.event-sourced';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { TAG_QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../tag/repositories/tag-query-repository.interface';
import { CoscradContributor } from '../../user-management';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { GeospatialMapViewModel } from '../queries/geospatial-map.view-model';
import {
    GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN,
    IGeospatialMapQueryRepository,
} from './geospatial-map-query-repository.interface';

const testAdminUser = new CoscradUserWithGroups(
    buildTestInstance(CoscradUser, {
        roles: [CoscradUserRole.superAdmin],
    }),
    []
);

describe(`ArangoGeospatialMapQueryRepository`, () => {
    let testQueryRepository: IGeospatialMapQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), GeospatialMapModule],
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

        await app.init();

        testQueryRepository = app.get(GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN);

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

    const geospatialMapIds = [1, 2, 3].map(buildDummyUuid);

    const buildTextForGeospatialMapName = (id: string) => `geospatial map ${id}`;

    const geospatialMapName = buildTextForGeospatialMapName(geospatialMapIds[0]);

    const originalLanguageCode = LanguageCode.English;

    const translationLanguageCode = LanguageCode.Chilcotin;

    const translationTextForName = 'translation of name';

    const geospatialMapViews: GeospatialMapViewModel[] = geospatialMapIds.map((id) => {
        const name = buildMultilingualTextWithSingleItem(
            buildTextForGeospatialMapName(id),
            originalLanguageCode
        );

        return buildTestInstance(GeospatialMapViewModel, {
            id,
            name,
        });
    });

    describe(`fetchById`, () => {
        const targetGeospatialMapId = geospatialMapIds[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(geospatialMapViews[0]);
        });

        describe(`when there is a geospatial map with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(
                    targetGeospatialMapId,
                    testAdminUser
                );

                expect(result).not.toBe(NotFound);

                const { name } = result as GeospatialMapViewModel;

                const foundOriginalTextForGeospatialMap = name.items.find(
                    ({ languageCode }) => languageCode === originalLanguageCode
                ).text;

                expect(foundOriginalTextForGeospatialMap).toBe(geospatialMapName);
            });
        });

        describe(`when there is no geospatial map with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('BOGUS_420');

                expect(result).toBe(NotFound);
            });
        });

        describe(`fetchMany`, () => {
            beforeEach(async () => {
                await databaseProvider.clearViews();

                await testQueryRepository.createMany(geospatialMapViews);
            });

            it(`should return the expected geospatial map views`, async () => {
                const { entities: result } = await testQueryRepository.fetchMany({
                    user: testAdminUser,
                });

                expect(result).toHaveLength(geospatialMapIds.length);
            });
        });

        describe(`count`, () => {
            describe(`when there are geospatial map views in the database`, () => {
                beforeEach(async () => {
                    await databaseProvider.clearViews();

                    await testQueryRepository.createMany(geospatialMapViews);
                });

                it(`should return the expected result`, async () => {
                    const result = await testQueryRepository.count();

                    expect(result).toBe(geospatialMapViews.length);
                });
            });
        });

        describe(`create`, () => {
            beforeEach(async () => {
                await databaseProvider.clearViews();
            });

            it(`should create the correct geospatial map view`, async () => {
                const geospatialMapToCreate = geospatialMapViews[0];

                await testQueryRepository.create(geospatialMapToCreate);

                const searchResult = await testQueryRepository.fetchById(
                    geospatialMapToCreate.id,
                    testAdminUser
                );

                expect(searchResult).not.toBe(NotFound);

                const foundGeospatialMapView = searchResult as GeospatialMapViewModel;

                const name = new MultilingualText(foundGeospatialMapView.name);

                const foundNameText = name.getOriginalTextItem().text;

                expect(foundNameText).toBe(geospatialMapName);
            });
        });

        describe(`createMany`, () => {
            beforeEach(async () => {
                await databaseProvider.clearViews();
            });

            it(`should create the expected spatial feature views`, async () => {
                await testQueryRepository.createMany(geospatialMapViews);

                const actualCount = await testQueryRepository.count();

                expect(actualCount).toBe(geospatialMapViews.length);
            });
        });

        describe(`tag`, () => {
            const existingTagLabel = 'freebies';

            const existingTag: TagViewModel = {
                id: buildDummyUuid(7),
                label: existingTagLabel,
                name: buildMultilingualTextWithSingleItem(existingTagLabel),
                members: [],
            };

            const newTagId = buildDummyUuid(6);

            const newTagLabel = 'no wayy';

            const newTag = buildTestInstance(EventSourcedTagViewModel, {
                id: newTagId,
                label: newTagLabel,
            });

            const targetGeospatialMap = buildTestInstance(GeospatialMapViewModel, {
                tags: [existingTag],
            });

            beforeEach(async () => {
                await databaseProvider.getDatabaseForCollection(ArangoCollectionId.tags).clear();

                await databaseProvider.clearViews();

                await testQueryRepository.create(targetGeospatialMap);

                await app.get(TAG_QUERY_REPOSITORY_PROVIDER_TOKEN).create(newTag);
            });

            it(`should tag the geospatial map`, async () => {
                await testQueryRepository.tag(targetGeospatialMap.id, newTag.id);

                const { tags } = (await testQueryRepository.fetchById(
                    targetGeospatialMap.id,
                    testAdminUser
                )) as GeospatialMapViewModel;

                expect(tags).toHaveLength(2);

                const tagSearchResult = tags.find(({ id }) => id === newTag.id);

                expect(tagSearchResult).toBeTruthy();

                const { label } = tagSearchResult;

                expect(label).toBe(newTagLabel);
            });
        });
    });
});
