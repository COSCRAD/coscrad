import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../../../queries/presentation/formatAggregateType';
import getValidAggregateInstanceForTest from '../../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../../../types/ResourceType';
import { assertCommandError } from '../../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../../shared/common-command-errors/CommandExecutionError';
import InvalidCommandPayloadTypeError from '../../../../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { CannotOverwriteTranscriptError } from '../../../../audio-item/errors';
import { Video } from '../../../../video/entities/video.entity';
import { Transcript } from '../../../entities/transcript.entity';
import { CreateTranscript } from './create-transcript.command';

const commandType = `CREATE_TRANSCRIPT`;

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    transcript: undefined,
});

const existingVideo = getValidAggregateInstanceForTest(AggregateType.video).clone({
    transcript: undefined,
});

const validResourcesForTests = [existingAudioItem, existingVideo];

const buildValidCommandFSA = (validResource: AudioItem | Video) => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: validResource.getCompositeIdentifier(),
    },
});

const systemUserId = buildDummyUuid(555);

const validInitialState = new DeluxeInMemoryStore({
    resources: {
        [AggregateType.audioItem]: [existingAudioItem],
        [AggregateType.video]: [existingVideo],
    },
}).fetchFullSnapshotInLegacyFormat();

const audiovisualResourceTypes = [ResourceType.audioItem, ResourceType.video];

describe(commandType, () => {
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

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    Object.values(ResourceType)
        .filter((resourceType) => !audiovisualResourceTypes.includes(resourceType))
        .forEach((nonAudiovisualResourceType) =>
            describe(`when the command invalidly targets a non-audiovisual resource`, () => {
                it(`should fail with the expected error`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        buildCommandFSA: () => ({
                            type: commandType,
                            payload: {
                                aggregateCompositeIdentifier: {
                                    id: buildDummyUuid(432),
                                    type: nonAudiovisualResourceType,
                                },
                            },
                        }),
                        systemUserId: dummySystemUserId,
                        initialState: validInitialState,
                        checkError: (error) => {
                            expect(error).toBeInstanceOf(InvalidCommandPayloadTypeError);
                            // expect(error.toString().includes('aggregateCompositeIdentifier')).toBe(
                            //     true
                            // );
                        },
                    });
                });
            })
        );

    validResourcesForTests.forEach((instance) => {
        const resourceType = instance.type;

        describe(`when working with a resource of type: ${formatAggregateType(
            resourceType
        )}`, () => {
            describe(`when the command is valid`, () => {
                describe(`when adding a transcript`, () => {
                    it('should succeed with the expected database updates', async () => {
                        await assertCommandSuccess(assertionHelperDependencies, {
                            systemUserId,
                            initialState: validInitialState,
                            buildValidCommandFSA: () => buildValidCommandFSA(instance),
                            checkStateOnSuccess: async ({
                                aggregateCompositeIdentifier: { id },
                            }: CreateTranscript) => {
                                const resourceSearchResult = await testRepositoryProvider
                                    .forResource<AudioItem | Video>(resourceType)
                                    .fetchById(id);

                                expect(resourceSearchResult).not.toBe(NotFound);

                                expect(resourceSearchResult).not.toBeInstanceOf(InternalError);

                                const updatedResource = resourceSearchResult as unknown as
                                    | AudioItem
                                    | Video;

                                expect(updatedResource.hasTranscript()).toBe(true);

                                assertEventRecordPersisted(
                                    updatedResource,
                                    'TRANSCRIPT_CREATED',
                                    systemUserId
                                );
                            },
                        });
                    });
                });
            });

            describe(`when the command is invalid`, () => {
                describe(`when the payload has an invalid type`, () => {
                    describe('when the command payload type is invalid', () => {
                        generateCommandFuzzTestCases(CreateTranscript).forEach(
                            ({ description, propertyName, invalidValue }) => {
                                describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                                    it('should fail with the appropriate error', async () => {
                                        await assertCommandFailsDueToTypeError(
                                            assertionHelperDependencies,
                                            { propertyName, invalidValue },
                                            buildValidCommandFSA(instance)
                                        );
                                    });
                                });
                            }
                        );
                    });
                });

                describe(`when there is no resource with the given aggregateCompositeIdentifier`, () => {
                    it('should fail with the expected error', async () => {
                        await assertCommandError(assertionHelperDependencies, {
                            buildCommandFSA: () => buildValidCommandFSA(instance),
                            systemUserId,
                            initialState: new DeluxeInMemoryStore({
                                // empty- no existing resources
                            }).fetchFullSnapshotInLegacyFormat(),
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new AggregateNotFoundError(
                                            instance.getCompositeIdentifier()
                                        ),
                                    ])
                                );
                            },
                        });
                    });
                });

                describe(`when the resource already has a transcript`, () => {
                    it('should fail with the expected error', async () => {
                        await assertCommandError(assertionHelperDependencies, {
                            buildCommandFSA: () => buildValidCommandFSA(instance),
                            systemUserId,
                            initialState: new DeluxeInMemoryStore({
                                [instance.type]: [
                                    instance.clone({
                                        transcript: new Transcript({
                                            items: [],
                                            participants: [],
                                        }),
                                    }),
                                ],
                            }).fetchFullSnapshotInLegacyFormat(),
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new CannotOverwriteTranscriptError(
                                            instance.getCompositeIdentifier()
                                        ),
                                    ])
                                );
                            },
                        });
                    });
                });
            });
        });
    });
});
