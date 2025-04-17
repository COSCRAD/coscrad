import { AggregateType, FluxStandardAction, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { AudioItemCreated } from '../../../audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioItem } from '../../../audio-visual/audio-item/entities/audio-item.entity';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Playlist } from '../../entities';
import { PlaylistItem } from '../../entities/playlist-item.entity';
import { CannotAddDuplicateItemToPlaylist } from '../../errors';
import { FailedToImportAudioItemsError } from '../../errors/failed-to-import-audio-items.error';
import { AudioItemAddedToPlaylist } from '../add-audio-item-to-playlist/audio-item-added-to-playlist.event';
import { PlaylistCreated } from '../playlist-created.event';
import { ImportAudioItemsToPlaylist } from './import-audio-items-to-playlist.command';

const commandType = 'IMPORT_AUDIO_ITEMS_TO_PLAYLIST';

const playlistId = buildDummyUuid(1);

const playlistCompositeIdentifier = {
    type: AggregateType.playlist,
    id: playlistId,
};

const playlistCreated = new TestEventStream().andThen<PlaylistCreated>({
    type: 'PLAYLIST_CREATED',
});

const existingPlaylist = Playlist.fromEventHistory(
    playlistCreated.as(playlistCompositeIdentifier),
    playlistId
) as Playlist;

getValidAggregateInstanceForTest(AggregateType.playlist).clone({
    items: [],
});

const existingAudioItems = Array(5)
    .fill(0)
    .map((_, index) => {
        const id = buildDummyUuid(index + 20);

        return AudioItem.fromEventHistory(
            new TestEventStream()
                .andThen<AudioItemCreated>({
                    type: 'AUDIO_ITEM_CREATED',
                })
                .as({
                    type: AggregateType.audioItem,
                    id,
                }),
            id
        ) as AudioItem;
    });

const existingAudioItemIds = existingAudioItems.map(({ id }) => id);

const validPayload: ImportAudioItemsToPlaylist = {
    aggregateCompositeIdentifier: {
        type: AggregateType.playlist,
        id: existingPlaylist.id,
    },
    audioItemIds: existingAudioItemIds,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<ImportAudioItemsToPlaylist>> =>
    validCommandFSA;

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
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                seedInitialState: async () => {
                    await testRepositoryProvider.addFullSnapshot(
                        new DeluxeInMemoryStore({
                            [AggregateType.playlist]: [existingPlaylist],
                            [AggregateType.audioItem]: existingAudioItems,
                        }).fetchFullSnapshotInLegacyFormat()
                    );
                },
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: playlistId },
                    audioItemIds,
                }: ImportAudioItemsToPlaylist) => {
                    const playlistSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.playlist)
                        .fetchById(playlistId);

                    expect(playlistSearchResult).not.toBe(NotFound);

                    const playlist = playlistSearchResult as Playlist;

                    const audioItemsNotInPlaylist = audioItemIds.filter(
                        (id) =>
                            !playlist.has({
                                type: AggregateType.audioItem,
                                id,
                            })
                    );

                    expect(audioItemsNotInPlaylist).toEqual([]);

                    assertEventRecordPersisted(
                        playlist,
                        'AUDIO_ITEMS_IMPORTED_TO_PLAYLIST',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when one of the audio items is already in the playlist', () => {
            const audioItemThatIsAlreadyOnPlaylist = existingAudioItems[2];

            it('should fail with the expected errors', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [existingAudioItems[0]],
                                [AggregateType.playlist]: [
                                    Playlist.fromEventHistory(
                                        playlistCreated
                                            .andThen<AudioItemAddedToPlaylist>({
                                                type: 'AUDIO_ITEM_ADDED_TO_PLAYLIST',
                                                payload: {
                                                    audioItemId:
                                                        audioItemThatIsAlreadyOnPlaylist.id,
                                                },
                                            })
                                            .as(playlistCompositeIdentifier),
                                        playlistId
                                    ) as Playlist,
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new FailedToImportAudioItemsError(existingPlaylist, [
                                    new CannotAddDuplicateItemToPlaylist(
                                        existingPlaylist.id,
                                        new PlaylistItem({
                                            resourceCompositeIdentifier:
                                                audioItemThatIsAlreadyOnPlaylist.getCompositeIdentifier(),
                                        })
                                    ),
                                ]),
                            ])
                        );
                    },
                });
            });
        });
    });

    describe(`when one of the audio items does not exist`, () => {
        const missingAudioItemId = buildDummyUuid(123);

        const missingAudioItem = existingAudioItems[0].clone({
            id: missingAudioItemId,
        });

        it(`should fail with the expected errors`, async () => {
            await assertCommandError(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildCommandFSA: () =>
                    new DummyCommandFsaFactory(buildValidCommandFSA).build(undefined, {
                        audioItemIds: [...existingAudioItemIds, missingAudioItemId],
                    }),
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.playlist]: [existingPlaylist],
                    [AggregateType.audioItem]: existingAudioItems,
                }).fetchFullSnapshotInLegacyFormat(),
                checkError: (error) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([
                            new InvalidExternalReferenceByAggregateError(
                                existingPlaylist.getCompositeIdentifier(),
                                [missingAudioItem.getCompositeIdentifier()]
                            ),
                        ])
                    );
                },
            });
        });
    });

    describe(`when the playlist does not exist`, () => {
        it(`should fail with the expected errors`, async () => {
            await assertCommandError(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildCommandFSA: buildValidCommandFSA,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.audioItem]: [existingAudioItems[0]],
                }).fetchFullSnapshotInLegacyFormat(),
                checkError: (error) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([
                            new AggregateNotFoundError(existingPlaylist.getCompositeIdentifier()),
                        ])
                    );
                },
            });
        });
    });

    describe(`when the aggregate composite identifier is of the wrong type`, () => {
        Object.values(AggregateType)
            .filter((aggregateType) => aggregateType !== AggregateType.playlist)
            .forEach((aggregateType) => {
                describe(`when the type is ${aggregateType}`, () => {
                    it(`should fail as expected`, async () => {
                        await assertCommandFailsDueToTypeError(
                            commandAssertionDependencies,
                            {
                                propertyName: 'aggregateCompositeIdentifer',
                                invalidValue: {
                                    type: aggregateType,
                                    id: existingPlaylist.id,
                                },
                            },
                            validCommandFSA
                        );
                    });
                });
            });
    });

    describe('when one of the properties on the  command payload has an invalid type', () => {
        generateCommandFuzzTestCases(ImportAudioItemsToPlaylist).forEach(
            ({ description, propertyName, invalidValue }) => {
                describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                    it('should fail with the appropriate error', async () => {
                        await assertCommandFailsDueToTypeError(
                            commandAssertionDependencies,
                            { propertyName, invalidValue },
                            validCommandFSA
                        );
                    });
                });
            }
        );
    });
});
