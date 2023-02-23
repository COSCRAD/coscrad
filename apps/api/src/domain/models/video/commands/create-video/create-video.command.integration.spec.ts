import {
    FluxStandardAction,
    LanguageCode,
    MIMEType,
    MultilingualTextItemRole,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../lib/errors/InternalError';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../../types/DTO';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertResourcePersistedProperly } from '../../../__tests__/command-helpers/assert-resource-persisted-properly';
import { DummyCommandFSAFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { CreateVideo } from './create-video.command';

const commandType = 'CREATE_VIDEO';

const existingMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    mimeType: MIMEType.mp4,
});

const newVideoName = new MultilingualText({
    items: [
        {
            languageCode: LanguageCode.Haida,
            text: 'New Video named in Haida',
            role: MultilingualTextItemRole.original,
        },
        {
            languageCode: LanguageCode.English,
            text: 'New Video named translated to  English',
            role: MultilingualTextItemRole.freeTranslation,
        },
    ],
});

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateVideo>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.video },
        name: newVideoName,
        mediaItemId: existingMediaItem.id,
        lengthMilliseconds: 12345,
    },
});

const _fsaFactory = new DummyCommandFSAFactory(buildValidCommandFSA);

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

        describe('when the MIME type of the media item is not an audio format', () => {
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

                const fsa = _fsaFactory.build(newId);

                await commandHandlerService.execute(fsa, {
                    userId: dummyAdminUserId,
                });

                const resultOfAttemptingToReuseId = await commandHandlerService.execute(
                    _fsaFactory.build(newId),
                    { userId: dummyAdminUserId }
                );

                expect(resultOfAttemptingToReuseId).toBeInstanceOf(CommandExecutionError);
            });
        });

        describe('when the command payload type is invalid', () => {
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
