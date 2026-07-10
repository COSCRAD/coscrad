import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { SpatialFeatureModule } from '../../../../../../app/domain-modules/spatial-feature.module';
import { CoscradEventFactory } from '../../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../../domain/common/build-multilingual-text-with-single-item';
import { ID_MANAGER_TOKEN } from '../../../../../../domain/interfaces/id-manager.interface';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../../test-data/events';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../../validation';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { AlternativeNameMatchesOriginalError } from '../../../errors/alternative-name-matches-original.error';
import { CannotOverwriteAlternativeNameWithLabelError } from '../../../errors/cannot-overwrite-alternative-name-with-label.error';
import { Point } from '../../entities/point.entity';
import { PointCreated } from '../create-point/point-created.event';
import { AddAlternativeNameForSpatialFeature } from './add-alternative-name-for-spatial-feature.command';

const commandType = 'ADD_ALTERNATIVE_NAME_FOR_SPATIAL_FEATURE';

const spatialFeatureId = buildDummyUuid(43);

const spatialFeatureName = 'The Test Point';

const spatialFeatureNameLanguageCode = LanguageCode.English;

const existingSpatialFeatureLanguageCode = LanguageCode.Chilcotin;

const eventHistoryForExistingPoint = new TestEventStream()
    .andThen<PointCreated>({
        type: 'POINT_CREATED',
        payload: {
            name: {
                text: spatialFeatureName,
                languageCode: spatialFeatureNameLanguageCode,
            },
        },
    })
    .as({ type: AggregateType.spatialFeature, id: spatialFeatureId });

const validPayload = buildTestInstance(AddAlternativeNameForSpatialFeature, {
    aggregateCompositeIdentifier: { id: spatialFeatureId },
    text: 'text for the spatial feature',
    languageCode: existingSpatialFeatureLanguageCode,
    label: 'the label for spatial feature',
});

const validFsa = {
    type: commandType,
    payload: validPayload,
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
                SpatialFeatureModule,
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

    const seedValidInitialState = async () => {
        await testRepositoryProvider
            .getEventRepository()
            .appendEvents(eventHistoryForExistingPoint);
    };

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: seedValidInitialState,
                buildValidCommandFSA: () => validFsa,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: AddAlternativeNameForSpatialFeature) => {
                    const searchResult = (await testRepositoryProvider
                        .forResource(AggregateType.spatialFeature)
                        .fetchById(id)) as Point;

                    const alternativeName = searchResult.properties.alternativeNamesByLabel.get(
                        validPayload.label
                    );

                    // TODO check language code too
                    expect(alternativeName.getOriginalTextItem().text).toBe(validPayload.text);

                    expect(alternativeName.getOriginalTextItem().languageCode).toBe(
                        validPayload.languageCode
                    );
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the target point does not exist`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        validPayload;
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (e) => {
                        assertErrorAsExpected(
                            e,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    validPayload.aggregateCompositeIdentifier
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when there is already an alternative name with the given label`, () => {
            const textForNewAlternativeName = 'oops I am stepping on your toes';

            const languageCodeForNewAlternativeName = LanguageCode.French;

            it(`should return the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () =>
                        clonePlainObjectWithOverrides(validFsa, {
                            payload: {
                                languageCode: languageCodeForNewAlternativeName,
                                text: textForNewAlternativeName,
                            },
                        }),
                    seedInitialState: async () => {
                        /**
                         * First we create an alternative name with the tareget label.
                         */
                        await assertCommandSuccess(assertionHelperDependencies, {
                            systemUserId: dummySystemUserId,
                            buildValidCommandFSA: () => validFsa,
                            seedInitialState: seedValidInitialState,
                        });
                    },
                    checkError: (e) => {
                        assertErrorAsExpected(
                            e,
                            new CommandExecutionError([
                                new CannotOverwriteAlternativeNameWithLabelError(
                                    buildMultilingualTextWithSingleItem(
                                        textForNewAlternativeName,
                                        languageCodeForNewAlternativeName
                                    ),
                                    buildMultilingualTextWithSingleItem(
                                        spatialFeatureName,
                                        spatialFeatureNameLanguageCode
                                    ),
                                    validPayload.label,
                                    buildMultilingualTextWithSingleItem(
                                        validPayload.text,
                                        validPayload.languageCode
                                    )
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the text and language code for the alternative name are the same as for the original name`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () =>
                        clonePlainObjectWithOverrides(validFsa, {
                            payload: {
                                text: spatialFeatureName,
                                languageCode: spatialFeatureNameLanguageCode,
                            },
                        }),
                    seedInitialState: seedValidInitialState,
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new AlternativeNameMatchesOriginalError(
                                    spatialFeatureName,
                                    spatialFeatureNameLanguageCode,
                                    validPayload.label
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
