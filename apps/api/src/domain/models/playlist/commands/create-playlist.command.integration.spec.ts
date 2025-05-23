import { LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../test-data/events';
import { DTO } from '../../../../types/DTO';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { assertCommandFailsDueToTypeError } from '../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyUuid } from '../../__tests__/utilities/dummyUuid';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import ResourceIdAlreadyInUseError from '../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import { Playlist } from '../entities';
import { CreatePlayList } from './create-playlist.command';
import { PlaylistCreated } from './playlist-created.event';

const commandType = 'CREATE_PLAYLIST';

const existingPlaylistId = `702096a0-c52f-488f-b5dc-22192e9aca3e`;

const existingPlaylist = Playlist.fromEventHistory(
    new TestEventStream()
        .andThen<PlaylistCreated>({
            type: 'PLAYLIST_CREATED',
        })
        .as({
            type: AggregateType.playlist,
            id: existingPlaylistId,
        }),
    existingPlaylistId
);

if (isInternalError(existingPlaylist) || isNotFound(existingPlaylist)) {
    throw new InternalError(`Invalid test setup for playlist event history`);
}

const {
    text: existingPlaylistOrignalNameText,
    languageCode: existingPlaylistNameOrignalLanguageCode,
} = existingPlaylist.name.getOriginalTextItem();

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreatePlayList>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.playlist },
        name: 'dummy playlist name',
        languageCodeForName: LanguageCode.Chilcotin,
    },
});

const fsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

const emptyInitialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

const dummyAdminUserId = dummyUuid;

//TODO insure that an invaild multilingual test name property fails
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

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummyAdminUserId,
                buildValidCommandFSA,
                initialState: emptyInitialState,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreatePlayList) => {
                    const idStatus = await idManager.status(id);

                    expect(idStatus).toBe(NotAvailable);

                    const playlistSearchResult = await testRepositoryProvider
                        .forResource<Playlist>(ResourceType.playlist)
                        .fetchById(id);

                    expect(playlistSearchResult).not.toBe(NotFound);

                    expect(playlistSearchResult).not.toBeInstanceOf(InternalError);

                    expect(playlistSearchResult).toBeInstanceOf(Playlist);

                    const playlist = playlistSearchResult as Playlist;

                    assertEventRecordPersisted(playlist, 'PLAYLIST_CREATED', dummyAdminUserId);
                },
            });
        });
    });

    describe('when the command payload type is invalid', () => {
        describe(`when the payload has an invalid aggregate type`, () => {
            Object.values(AggregateType)
                .filter((t) => t !== AggregateType.playlist)
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

        generateCommandFuzzTestCases(CreatePlayList).forEach(
            ({ description, propertyName, invalidValue }) => {
                describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                    it('should fail with the appropriate error', async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            { propertyName, invalidValue },
                            buildValidCommandFSA('unused-id')
                        );
                    });
                });
            }
        );
    });

    describe('when external state is invalid', () => {
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

        describe('when there is already a playlist with the given id', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildCommandFSA: (_: AggregateId) => buildValidCommandFSA(existingPlaylistId),
                    initialState: buildInMemorySnapshot({
                        resources: {
                            playlist: [existingPlaylist],
                        },
                    }),

                    checkError: (error) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors.length).toBe(1);

                        const innerError = error.innerErrors[0].innerErrors[0];

                        expect(innerError).toEqual(
                            new ResourceIdAlreadyInUseError({
                                id: existingPlaylistId,
                                resourceType: ResourceType.playlist,
                            })
                        );
                    },
                });
            });
        });

        describe('When there is already a playlist with a given name', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildCommandFSA: (id: AggregateId) =>
                        fsaFactory.build(id, {
                            languageCodeForName: existingPlaylistNameOrignalLanguageCode,
                            name: existingPlaylistOrignalNameText,
                        }),
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.playlist]: [existingPlaylist],
                    }).fetchFullSnapshotInLegacyFormat(),
                });
            });
        });
    });

    // Note that it's not possible to invalidate the invariants by design
});
