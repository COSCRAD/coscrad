import {
    AggregateType,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { GeospatialMapModule } from '../../../../../app/domain-modules/geospatial-map.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { ID_MANAGER_TOKEN } from '../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../validation';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { GeospatialMap } from '../../geospatial-map.entity';
import { MapCreated } from '../map-created.event';
import { MapNameTranslated } from './map-name-translated.event';
import { TranslateMapName } from './translate-map-name.command';

const commandType = 'TRANSLATE_MAP_NAME';

const geospatialId = buildDummyUuid(4);

const geospatialCompositeIdentifier = {
    type: AggregateType.map,
    id: geospatialId,
};

const originalLanguageCode = LanguageCode.English;

const translationLanguageCode = LanguageCode.Chilcotin;

const translationGeoSpatialText = 'translation of the geospatial map name';

const mapCreated = new TestEventStream().andThen<MapCreated>(
    {
        type: 'MAP_CREATED',
        payload: {
            aggregateCompositeIdentifier: geospatialCompositeIdentifier,
            name: { text: 'map name translation', languageCode: originalLanguageCode },
        },
    },
    MapCreated
);

const mapNameTranslated = mapCreated.andThen<MapNameTranslated>(
    {
        type: 'MAP_NAME_TRANSLATED',
        payload: {
            translationOfName: {
                text: translationGeoSpatialText,
                languageCode: translationLanguageCode,
            },
        },
    },
    MapNameTranslated
);

const eventHistoryForExistingGeospatialMap = mapCreated.as(geospatialCompositeIdentifier);

const validFsa = {
    type: commandType,
    payload: buildTestInstance(TranslateMapName, {
        aggregateCompositeIdentifier: geospatialCompositeIdentifier,
        translationOfName: translationGeoSpatialText,
        languageCode: translationLanguageCode,
    }),
};

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                GeospatialMapModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        testRepositoryProvider = new TestRepositoryProvider(
            app.get(ArangoDatabaseProvider),
            app.get(CoscradEventFactory),
            app.get(DynamicDataTypeFinderService)
        );

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService: app.get(CommandHandlerService),
            idManager: app.get(ID_MANAGER_TOKEN),
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        app.get(ArangoDatabaseProvider).close();

        app.close();
    });

    describe(`when the command is valid`, () => {
        it(`should translate the map name`, async () => {
            const existingGeospatialMap = GeospatialMap.fromEventHistory(
                eventHistoryForExistingGeospatialMap,
                geospatialId
            ) as GeospatialMap;

            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await testRepositoryProvider
                        .forResource(AggregateType.map)
                        .create(existingGeospatialMap);
                },
                buildValidCommandFSA: () => validFsa,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: TranslateMapName) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.map)
                        .fetchById(id);

                    expect(searchResult).toBeInstanceOf(GeospatialMap);

                    const updatedGeospatialMap = searchResult as GeospatialMap;

                    const translationSearchResult =
                        updatedGeospatialMap.name.getTranslation(translationLanguageCode);

                    expect(translationSearchResult).toBeInstanceOf(MultilingualTextItem);

                    const translationTextItem = translationSearchResult as MultilingualTextItem;

                    expect(translationTextItem.text).toBe(translationGeoSpatialText);

                    expect(translationTextItem.role).toBe(MultilingualTextItemRole.freeTranslation);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the geospatial map does not exist`, () => {
            it(`should return with the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        return Promise.resolve();
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        const message = error.toString();

                        expect(message).toContain('Failed to update');
                    },
                });
            });
        });

        describe(`when there is already a translation in the given language`, () => {
            it(`should return the expected error`, async () => {
                const eventHistory = mapNameTranslated.as(geospatialCompositeIdentifier);
                const existingGeospatialMap = GeospatialMap.fromEventHistory(
                    eventHistory,
                    geospatialId
                ) as GeospatialMap;
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.map)
                            .create(existingGeospatialMap);
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        const message = error.toString();

                        expect(message).toContain(translationLanguageCode);
                    },
                });
            });
        });

        describe(`when the translation language is the same as the original `, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.forResource(ResourceType.map).create(
                            GeospatialMap.fromEventHistory(
                                mapCreated
                                    .andThen<MapNameTranslated>({
                                        type: 'MAP_NAME_TRANSLATED',
                                        payload: {
                                            translationOfName: {
                                                languageCode: translationLanguageCode,
                                            },
                                        },
                                    })
                                    .as(geospatialCompositeIdentifier),
                                geospatialId
                            ) as GeospatialMap
                        );
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        const message = error.toString();

                        expect(message).toContain(originalLanguageCode);

                        expect(message).toContain('cannot add');
                    },
                });
            });
        });
    });
});
