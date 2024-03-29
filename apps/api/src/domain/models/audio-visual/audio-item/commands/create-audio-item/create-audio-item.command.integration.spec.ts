import { LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../../../lib/types/not-available';
import { NotFound } from '../../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../../types/DTO';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../../types/AggregateId';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../../types/ResourceType';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyUuid } from '../../../../__tests__/utilities/dummyUuid';
import InvalidExternalReferenceByAggregateError from '../../../../categories/errors/InvalidExternalReferenceByAggregateError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { AudioItem, isAudioMimeType } from '../../entities/audio-item.entity';
import { CreateAudioItem } from './create-audio-item.command';

const commandType = 'CREATE_AUDIO_ITEM';

const existingMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    id: buildDummyUuid(55),
});

const originalTextForNewAudioItemName = 'A Walk in the Park (lang)';

const languageCodeForName = LanguageCode.Chilcotin;

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateAudioItem>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.audioItem },
        name: originalTextForNewAudioItemName,
        languageCodeForName: languageCodeForName,
        mediaItemId: existingMediaItem.id,
        lengthMilliseconds: 34560,
    },
});

const buildInvalidCommandFSA = (
    id: AggregateId,
    payloadOverrides: Partial<Record<keyof CreateAudioItem, unknown>> = {}
) => new DummyCommandFsaFactory(buildValidCommandFSA).build(id, payloadOverrides);

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.mediaItem]: [existingMediaItem],
}).fetchFullSnapshotInLegacyFormat();

const dummyAdminUserId = dummyUuid;
describe('CREATE_AUDIO_ITEM', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
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

        databaseProvider.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when the command payload is valid', () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummyAdminUserId,
                buildValidCommandFSA,
                initialState: validInitialState,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateAudioItem) => {
                    const idStatus = await idManager.status(id);

                    expect(idStatus).toBe(NotAvailable);

                    const audioItemSearchResult = await testRepositoryProvider
                        .forResource<AudioItem>(ResourceType.audioItem)
                        .fetchById(id);

                    expect(audioItemSearchResult).not.toBe(NotFound);

                    expect(audioItemSearchResult).not.toBeInstanceOf(InternalError);

                    const audioItem = audioItemSearchResult as unknown as AudioItem;

                    assertEventRecordPersisted(audioItem, 'AUDIO_ITEM_CREATED', dummyAdminUserId);
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the command payload type is invalid', () => {
            describe(`when the payload has an invalid aggregate type`, () => {
                Object.values(AggregateType)
                    .filter((t) => t !== AggregateType.audioItem)
                    .forEach((invalidAggregateType) => {
                        it(`should fail with the expected error`, async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                {
                                    propertyName: 'aggregateCompositeIdentifier',
                                    invalidValue: {
                                        type: invalidAggregateType,
                                        id: buildDummyUuid(15),
                                    },
                                },
                                buildValidCommandFSA(buildDummyUuid(12))
                            );
                        });
                    });
            });

            generateCommandFuzzTestCases(CreateAudioItem).forEach(
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

        describe('when there is no media item with the given `mediaItemId`', () => {
            it('should fail with the appropriate error', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: buildInvalidCommandFSA,
                    seedInitialState: async () => {
                        // empty database
                        await Promise.resolve();
                    },
                    systemUserId: dummyAdminUserId,
                    checkError: (error) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        const innerError = error.innerErrors[0];

                        expect(innerError).toBeInstanceOf(InvalidExternalReferenceByAggregateError);
                    },
                });
            });
        });

        describe('when the MIME type of the media item is not an audio format', () => {
            const disallowedMIMETypes = Object.values(MIMEType).filter(
                (mimeType) => ![MIMEType.mp3, MIMEType.wav].includes(mimeType)
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
                                        /**
                                         * It's unfortunate that this mimics the
                                         * implementation a bit. But it's necessary
                                         * to avoid invariant validation errors
                                         * as an audio item with an image MIME Type
                                         * cannot have a `lengthMilliseconds`.
                                         */
                                        lengthMilliseconds: isAudioMimeType(mimeType)
                                            ? 12345
                                            : undefined,
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

        describe(`when there is already an audio item with the given ID`, () => {
            it('should fail with the expected error', async () => {
                const newId = await idManager.generate();

                const fsa = buildValidCommandFSA(newId);

                await commandHandlerService.execute(fsa, {
                    userId: dummyAdminUserId,
                });

                const resultOfAttemptingToReuseId = await commandHandlerService.execute(
                    buildValidCommandFSA(newId),
                    { userId: dummyAdminUserId }
                );

                expect(resultOfAttemptingToReuseId).toBeInstanceOf(CommandExecutionError);
            });
        });

        /**
         * In the near future, we will want to have a `MediaManagementService`
         * that takes care of validating the media item state. At that point,
         * we should validate the lengthMilliseconds property against the actual
         * media item or else determine this property during validation and put
         * it on the event for future reference \ event sourcing.
         */
    });
});
