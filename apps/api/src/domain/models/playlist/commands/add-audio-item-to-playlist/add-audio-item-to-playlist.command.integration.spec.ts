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
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Playlist } from '../../entities';
import { PlaylistItem } from '../../entities/playlist-item.entity';
import { CannotAddDuplicateItemToPlaylist } from '../../errors';
import { AddAudioItemToPlaylist } from './add-audio-item-to-playlist.command';

const commandType = 'ADD_AUDIO_ITEM_TO_PLAYLIST';

const existingPlaylist = getValidAggregateInstanceForTest(AggregateType.playlist).clone({
    items: [],
});

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const validPayload: AddAudioItemToPlaylist = {
    aggregateCompositeIdentifier: {
        type: AggregateType.playlist,
        id: existingPlaylist.id,
    },
    audioItemId: existingAudioItem.id,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<AddAudioItemToPlaylist>> => validCommandFSA;

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
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.playlist]: [existingPlaylist],
                    [AggregateType.audioItem]: [existingAudioItem],
                }).fetchFullSnapshotInLegacyFormat(),
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: playlistId },
                    audioItemId,
                }: AddAudioItemToPlaylist) => {
                    const audioSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.audioItem)
                        .fetchById(audioItemId);

                    expect(audioSearchResult).not.toBe(NotFound);

                    const playlistSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.playlist)
                        .fetchById(playlistId);

                    expect(playlistSearchResult).not.toBe(NotFound);

                    const playlist = playlistSearchResult as Playlist;

                    const isAudioItemInPlaylist = playlist.has({
                        type: AggregateType.audioItem,
                        id: audioItemId,
                    });

                    expect(isAudioItemInPlaylist).toBe(true);

                    assertEventRecordPersisted(
                        playlist,
                        'AUDIO_ITEM_ADDED_TO_PLAYLIST',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the audio item is already in the playlist', () => {
            it('should fail with the expected errors', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.audioItem]: [existingAudioItem],
                        [AggregateType.playlist]: [
                            existingPlaylist.clone({
                                items: [
                                    {
                                        resourceCompositeIdentifier:
                                            existingAudioItem.getCompositeIdentifier(),
                                    },
                                ],
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddDuplicateItemToPlaylist(
                                    existingPlaylist.id,
                                    new PlaylistItem({
                                        resourceCompositeIdentifier:
                                            existingAudioItem.getCompositeIdentifier(),
                                    })
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the audio item does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.playlist]: [existingPlaylist],
                        // no audio items!
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    existingPlaylist.getCompositeIdentifier(),
                                    [existingAudioItem.getCompositeIdentifier()]
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
                        [AggregateType.audioItem]: [existingAudioItem],
                        // no playlists!
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    existingPlaylist.getCompositeIdentifier()
                                ),
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
                    describe(`when the type is: ${aggregateType}`, () => {
                        it(`should fail as expected`, async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                {
                                    propertyName: 'aggregateCompositeIdentifier',
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

        describe('when one of the properties on the command payload has an invalid type', () => {
            generateCommandFuzzTestCases(AddAudioItemToPlaylist).forEach(
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
});
