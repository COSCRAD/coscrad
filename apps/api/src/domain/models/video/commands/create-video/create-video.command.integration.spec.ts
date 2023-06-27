import {
    FluxStandardAction,
    LanguageCode,
    MIMEType,
    MultilingualTextItemRole,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../lib/errors/InternalError';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertResourcePersistedProperly } from '../../../__tests__/command-helpers/assert-resource-persisted-properly';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { CreateVideo } from './create-video.command';

const commandType = 'CREATE_VIDEO';

const existingMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    mimeType: MIMEType.mp4,
});

const newVideoName = 'New Video named in Haida';

const languageCodeForNewVideoName = LanguageCode.Haida;

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateVideo>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.video },
        name: newVideoName,
        languageCodeForName: languageCodeForNewVideoName,
        mediaItemId: existingMediaItem.id,
        lengthMilliseconds: 12345,
    },
});

const fsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.mediaItem]: [existingMediaItem],
}).fetchFullSnapshotInLegacyFormat();

const dummyAdminUserId = buildDummyUuid(123);

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummyAdminUserId,
                buildValidCommandFSA,
                initialState: validInitialState,
                checkStateOnSuccess: async ({ aggregateCompositeIdentifier }: CreateVideo) => {
                    await assertResourcePersistedProperly(
                        idManager,
                        testRepositoryProvider,
                        aggregateCompositeIdentifier as ResourceCompositeIdentifier,
                        {
                            eventType: 'VIDEO_CREATED',
                            adminUserId: dummyAdminUserId,
                        }
                    );
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when there is no media item with the given `mediaItemId`', () => {
            it('should fail with the appropriate error', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: new DeluxeInMemoryStore({
                        // no media items
                    }).fetchFullSnapshotInLegacyFormat(),
                    systemUserId: dummyAdminUserId,
                    checkError: (error) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors[0]).toBeInstanceOf(
                            InvalidExternalReferenceByAggregateError
                        );
                    },
                });
            });
        });

        describe('when the MIME type of the media item is not an video format', () => {
            const disallowedMIMETypes = Object.values(MIMEType).filter(
                (mimeType) => ![MIMEType.mp4].includes(mimeType)
            );

            disallowedMIMETypes.forEach((mimeType) => {
                describe(`MIME type: ${mimeType}`, () => {
                    it('should fail with the expected error', async () => {
                        await assertCreateCommandError(assertionHelperDependencies, {
                            buildCommandFSA: buildValidCommandFSA,
                            initialState: new DeluxeInMemoryStore({
                                [AggregateType.mediaItem]: [
                                    existingMediaItem.clone({
                                        mimeType,
                                    }),
                                ],
                            }).fetchFullSnapshotInLegacyFormat(),
                            systemUserId: dummyAdminUserId,
                        });
                    });
                });
            });
        });

        describe('when the ID was not generated by our system', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildCommandFSA: (_: AggregateId) => buildValidCommandFSA(buildDummyUuid()),
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        const innerError = error.innerErrors[0];

                        expect(innerError).toBeInstanceOf(InternalError);
                    },
                });
            });
        });

        describe('when there is already a video with the given ID', () => {
            it('should fail with the expected error', async () => {
                const newId = await idManager.generate();

                const fsa = fsaFactory.build(newId);

                await commandHandlerService.execute(fsa, {
                    userId: dummyAdminUserId,
                });

                const resultOfAttemptingToReuseId = await commandHandlerService.execute(
                    fsaFactory.build(newId),
                    { userId: dummyAdminUserId }
                );

                expect(resultOfAttemptingToReuseId).toBeInstanceOf(CommandExecutionError);
            });
        });

        describe('when the command payload type is invalid', () => {
            describe('when there is no original item in the multilingual text provided', () => {
                const multiLingualTextWithNoOriginal: DTO<MultilingualText> = {
                    items: [
                        {
                            role: MultilingualTextItemRole.freeTranslation,
                            languageCode: LanguageCode.Chilcotin,
                            text: 'I am not sure how I got here!',
                        },
                    ],
                };

                it('should fail', async () => {
                    await assertCreateCommandError(assertionHelperDependencies, {
                        systemUserId: dummyAdminUserId,
                        initialState: new DeluxeInMemoryStore({
                            [ResourceType.mediaItem]: [existingMediaItem],
                        }).fetchFullSnapshotInLegacyFormat(),
                        buildCommandFSA: (id: AggregateId) =>
                            fsaFactory.build(id, {
                                name: multiLingualTextWithNoOriginal,
                            }),
                    });
                });
            });

            describe('when there are two original items in the multilingual text provided', () => {
                it('should fail', async () => {
                    const multiLingualTextWithTwoOriginals: DTO<MultilingualText> = {
                        items: [
                            {
                                role: MultilingualTextItemRole.original,
                                languageCode: LanguageCode.Haida,
                                text: 'I am the original!',
                            },
                            {
                                role: MultilingualTextItemRole.original,
                                languageCode: LanguageCode.English,
                                text: 'No, me!',
                            },
                        ],
                    };

                    await assertCreateCommandError(assertionHelperDependencies, {
                        systemUserId: dummyAdminUserId,
                        initialState: new DeluxeInMemoryStore({
                            [ResourceType.mediaItem]: [existingMediaItem],
                        }).fetchFullSnapshotInLegacyFormat(),
                        buildCommandFSA: (id: AggregateId) =>
                            fsaFactory.build(id, {
                                name: multiLingualTextWithTwoOriginals,
                            }),
                    });
                });
            });

            generateCommandFuzzTestCases(CreateVideo).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSA(buildDummyUuid(789))
                            );
                        });
                    });
                }
            );
        });
    });
});
