import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import getValidAggregateInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { assertCommandPayloadTypeError } from '../../../models/__tests__/command-helpers/assert-command-payload-type-error';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import AggregateNotFoundError from '../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import { assertCommandError } from '../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { MediaItem } from '../entities/media-item.entity';
import { PublishMediaItem } from './publish-media-item.command';
import { PublishMediaItemCommandHandler } from './publish-media-item.command-handler';

const commandType = 'PUBLISH_MEDIA_ITEM';

const dummyUUID = buildDummyUuid();

const validCommandFSA: FluxStandardAction<DTO<PublishMediaItem>> = {
    type: commandType,
    payload: { id: dummyUUID },
};

const buildInvalidCommandFSA = (id: unknown) => ({
    type: commandType,
    payload: { id },
});

const unpublishedMediaItem = getValidAggregateInstanceForTest(ResourceType.mediaItem).clone({
    published: false,
    id: dummyUUID,
});

const buildFullSnapshot = (preExistingMediaItem: MediaItem) =>
    buildInMemorySnapshot({
        resources: {
            mediaItem: [preExistingMediaItem],
        },
    });

const initialState = buildFullSnapshot(unpublishedMediaItem);

describe('PublishMediaItem', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: Omit<CommandAssertionDependencies, 'idManager'>;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, arangoConnectionProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: 'testonly-333',
                // generateRandomTestDatabaseName(),
            }));

        commandHandlerService.registerHandler(
            commandType,
            new PublishMediaItemCommandHandler(testRepositoryProvider, idManager)
        );

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
        };
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                buildValidCommandFSA: () => validCommandFSA,
                initialState,
                systemUserId: dummySystemUserId,
                checkStateOnSuccess: async () => {
                    const result = await testRepositoryProvider
                        .forResource(ResourceType.mediaItem)
                        .fetchById(validCommandFSA.payload.id);

                    expect(result).toBeInstanceOf(MediaItem);

                    const updatedInstance = result as MediaItem;

                    const { id, published } = updatedInstance;

                    expect(id).toBe(unpublishedMediaItem.id);

                    expect(published).toBe(true);

                    assertEventRecordPersisted(
                        updatedInstance,
                        'MEDIA_ITEM_PUBLISHED',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe('when the command payload has an invalid type', () => {
        describe('when the id is missing', () => {
            it('should fail', async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => ({
                        type: commandType,
                        payload: {},
                    }),
                    initialState,
                    checkError: (error: InternalError) => {
                        assertCommandPayloadTypeError(error, 'id');
                    },
                });
            });
        });

        describe('when the id is a number', () => {
            it('should fail', async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => buildInvalidCommandFSA(767),
                    initialState,
                    checkError: (error: InternalError) => {
                        assertCommandPayloadTypeError(error, 'id');
                    },
                });
            });
        });

        describe('when the id is an array', () => {
            it('should fail', async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => buildInvalidCommandFSA(['12', '123']),
                    initialState,
                    checkError: (error: InternalError) => {
                        assertCommandPayloadTypeError(error, 'id');
                    },
                });
            });
        });
    });

    describe('when the external state is invalid', () => {
        describe('when there is no media item with the given id', () => {
            it('should fail', async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => validCommandFSA,
                    // We invalidate the command by invalidating the pre-existing state
                    initialState: buildInMemorySnapshot({}),
                    checkError: (error: InternalError) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors[0]).toEqual(
                            new AggregateNotFoundError({
                                type: ResourceType.mediaItem,
                                id: validCommandFSA.payload.id,
                            })
                        );
                    },
                });
            });
        });
    });
});
