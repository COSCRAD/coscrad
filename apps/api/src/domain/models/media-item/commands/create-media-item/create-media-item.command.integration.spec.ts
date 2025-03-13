import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { MIMEType } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../../lib/types/not-available';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../utilities/buildInMemorySnapshot';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import ResourceIdAlreadyInUseError from '../../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import { MediaItemDimensions } from '../../entities/media-item-dimensions';
import { MediaItem } from '../../entities/media-item.entity';
import { CreateMediaItem } from './create-media-item.command';

const commandType = 'CREATE_MEDIA_ITEM';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateMediaItem>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.mediaItem },
        title: 'Fishing Video',
        mimeType: MIMEType.mp4,
    },
});

const existingMediaItemId = `702096a0-c52f-488f-b5dc-22192e9aca3e`;

const emptyInitialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

const dummyAdminUserId = dummyUuid;

const fsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

describe('CreateMediaItem', () => {
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

    describe('when the command is valid', () => {
        describe(`when creating an mp4`, () => {
            it('should succeed', async () => {
                await assertCreateCommandSuccess(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildValidCommandFSA,
                    seedInitialState: async () => {
                        // nothing to seed
                        Promise.resolve();
                    },
                    checkStateOnSuccess: async ({
                        aggregateCompositeIdentifier: { id },
                    }: CreateMediaItem) => {
                        const idStatus = await idManager.status(id);

                        expect(idStatus).toBe(NotAvailable);

                        const mediaItemSearchResult = await testRepositoryProvider
                            .forResource<MediaItem>(ResourceType.mediaItem)
                            .fetchById(id);

                        expect(mediaItemSearchResult).not.toBe(NotFound);

                        expect(mediaItemSearchResult).not.toBeInstanceOf(InternalError);

                        expect(mediaItemSearchResult).toBeInstanceOf(MediaItem);

                        const mediaItem = mediaItemSearchResult as MediaItem;

                        assertEventRecordPersisted(
                            mediaItem,
                            'MEDIA_ITEM_CREATED',
                            dummyAdminUserId
                        );
                    },
                });
            });
        });

        describe(`when creating a png`, () => {
            it(`should succeed`, async () => {
                const heightPx = 1200;

                const widthPx = 800;

                await assertCreateCommandSuccess(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildValidCommandFSA: (id) =>
                        fsaFactory.build(id, {
                            mimeType: MIMEType.png,
                            heightPx,
                            widthPx,
                        }),
                    seedInitialState: async () => {
                        // no necessary state
                        Promise.resolve();
                    },
                    checkStateOnSuccess: async ({
                        aggregateCompositeIdentifier: { id },
                    }: CreateMediaItem) => {
                        const searchResult = await testRepositoryProvider
                            .forResource(AggregateType.mediaItem)
                            .fetchById(id);

                        expect(searchResult).toBeInstanceOf(MediaItem);

                        const newMediaItem = searchResult as MediaItem;

                        expect(newMediaItem.dimensions).toBeInstanceOf(MediaItemDimensions);

                        expect(newMediaItem.dimensions.heightPx).toBe(heightPx);

                        expect(newMediaItem.dimensions.widthPx).toBe(widthPx);
                    },
                });
            });
        });
    });

    describe('when the external state is invalid', () => {
        describe('when the ID was not generated by our system', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildCommandFSA: (_: AggregateId) => buildValidCommandFSA(buildDummyUuid()),
                    initialState: emptyInitialState,
                    checkError: (error) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        const innerError = error.innerErrors[0];

                        expect(innerError).toBeInstanceOf(InternalError);
                    },
                });
            });
        });

        describe('when there is already a media item with the given id', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildCommandFSA: (_: AggregateId) => buildValidCommandFSA(existingMediaItemId),
                    initialState: buildInMemorySnapshot({
                        resources: {
                            mediaItem: [
                                getValidAggregateInstanceForTest(ResourceType.mediaItem).clone({
                                    id: existingMediaItemId,
                                }),
                            ],
                        },
                    }),

                    checkError: (error) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors.length).toBe(1);

                        const innerError = error.innerErrors[0];

                        expect(innerError).toEqual(
                            new ResourceIdAlreadyInUseError({
                                id: existingMediaItemId,
                                resourceType: ResourceType.mediaItem,
                            })
                        );
                    },
                });
            });
        });
    });

    describe(`when length milliseconds is specified for a media item that is not audio or video`, () => {
        it(`should fail with the expected error`, async () => {
            await assertCreateCommandError(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    // nothing to add
                    Promise.resolve();
                },
                buildCommandFSA: (id) =>
                    fsaFactory.build(id, {
                        lengthMilliseconds: 1234,
                        /**
                         * Note that we test this comprehensively across
                         * inconsistent MIME Types in the unit test for
                         * `MediaItem.validateInvariants`. We also check
                         * the errors in detail there. We prefer not to duplicate
                         * that test coverage here as this test leverages the
                         * network.
                         */
                        mimeType: MIMEType.png,
                    }),
            });
        });
    });

    describe(`when dimensions is specified for an audio file`, () => {
        it(`should fail with the expected error`, async () => {
            await assertCreateCommandError(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    // nothing to add
                    Promise.resolve();
                },
                buildCommandFSA: (id) =>
                    fsaFactory.build(id, {
                        lengthMilliseconds: undefined,
                        heightPx: 500,
                        widthPx: 1000,
                        /**
                         * Note that we test this comprehensively across
                         * inconsistent MIME Types in the unit test for
                         * `MediaItem.validateInvariants`. We also check
                         * the errors in detail there. We prefer not to duplicate
                         * that test coverage here as this test leverages the
                         * network.
                         */
                        mimeType: MIMEType.wav,
                    }),
            });
        });
    });
});
