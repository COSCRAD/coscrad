import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../../test-data/events';
import { CannotAddDuplicateTranslationError } from '../../../../../common/entities/errors';
import { MultilingualTextItem } from '../../../../../common/entities/multilingual-text';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { Video } from '../../entities/video.entity';
import { VideoCreated } from '../create-video';
import { TranslateVideoName } from './translate-video-name.command';
import { VideoNameTranslated } from './video-name-translated.event';

const commandType = `TRANSLATE_VIDEO_NAME`;

const languageCodeForExistingVideoName = LanguageCode.Haida;

const videoId = buildDummyUuid(1);

const videoCompositeIdentifier = {
    type: AggregateType.video,
    id: videoId,
};

const videoCreated = new TestEventStream().andThen<VideoCreated>({
    type: 'VIDEO_CREATED',
    payload: {
        name: 'this is the original video name',
        languageCodeForName: languageCodeForExistingVideoName,
    },
});

// We assert the event history is valid
const existingVideo = Video.fromEventHistory(
    videoCreated.as(videoCompositeIdentifier),
    videoId
) as Video;

const aggregateCompositeIdentifier = existingVideo.getCompositeIdentifier();

const textForTranslation = 'this is the translation of the video name';

const languageCodeForTranslation = LanguageCode.English;

const validFsa: CommandFSA<TranslateVideoName> = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier,
        text: textForTranslation,
        languageCode: languageCodeForTranslation,
    },
};

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }).catch((error) => {
                throw error;
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected database updates`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.video]: [existingVideo],
                }).fetchFullSnapshotInLegacyFormat(),
                buildValidCommandFSA: () => validFsa,
                checkStateOnSuccess: async () => {
                    const updatedVideoFromDatabase = (await testRepositoryProvider
                        .forResource(AggregateType.video)
                        .fetchById(existingVideo.getCompositeIdentifier().id)) as Video;

                    const searchResultForVideoNameInNewLanguage =
                        updatedVideoFromDatabase.name.getTranslation(languageCodeForTranslation);

                    expect(searchResultForVideoNameInNewLanguage).toBeInstanceOf(
                        MultilingualTextItem
                    );

                    const videoNameInNewLanguage =
                        searchResultForVideoNameInNewLanguage as MultilingualTextItem;

                    expect(videoNameInNewLanguage.role).toBe(
                        MultilingualTextItemRole.freeTranslation
                    );

                    expect(videoNameInNewLanguage.text).toBe(textForTranslation);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when there is no video with the given composite identifier`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(existingVideo.getCompositeIdentifier()),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the original text is in the target translation language`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.video]: [existingVideo],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () =>
                        new DummyCommandFsaFactory(() => validFsa).build(null, {
                            languageCode: languageCodeForExistingVideoName,
                        }),
                    checkError: (error) => {
                        const newItem = new MultilingualTextItem({
                            text: validFsa.payload.text,
                            role: MultilingualTextItemRole.freeTranslation,
                            languageCode: languageCodeForExistingVideoName,
                        });

                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddDuplicateTranslationError(newItem, existingVideo.name),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when there is already existing text in the translation language`, () => {
            it(`should fail with the expected errors`, async () => {
                const existingVideoWithTranslationInTargetLanguage = Video.fromEventHistory(
                    videoCreated
                        .andThen<VideoNameTranslated>({
                            type: 'VIDEO_NAME_TRANSLATED',
                            payload: {
                                text: 'existing translation in target language',
                                languageCode: languageCodeForTranslation,
                            },
                        })
                        .as(videoCompositeIdentifier),
                    videoId
                ) as Video;

                existingVideo.translateName(
                    'existing translation in target language',
                    languageCodeForTranslation
                ) as Video;

                // TODO use the newer API here and in other commands we are currently touching
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.video]: [existingVideoWithTranslationInTargetLanguage],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        const newItem = new MultilingualTextItem({
                            text: validFsa.payload.text,
                            role: MultilingualTextItemRole.freeTranslation,
                            languageCode: validFsa.payload.languageCode,
                        });

                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddDuplicateTranslationError(
                                    // TODO update this error class's API
                                    newItem,
                                    existingVideoWithTranslationInTargetLanguage.name
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the payload type is invalid`, () => {
            describe(`when aggregateCompositeIdentifier.type is not video`, () => {
                Object.values(AggregateType)
                    .filter((aggregateType) => aggregateType !== AggregateType.video)
                    .forEach((invalidType) => {
                        describe(`when the type is: ${invalidType}`, () => {
                            it(`should fail with the expected error`, async () => {
                                await assertCommandFailsDueToTypeError(
                                    commandAssertionDependencies,
                                    {
                                        propertyName: `aggregateCompositeIdentifier`,
                                        invalidValue: {
                                            type: invalidType,
                                            id: buildDummyUuid(468),
                                        },
                                    },
                                    validFsa
                                );
                            });
                        });
                    });
            });

            generateCommandFuzzTestCases(TranslateVideoName).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName, invalidValue },
                                validFsa
                            );
                        });
                    });
                }
            );
        });
    });
});
