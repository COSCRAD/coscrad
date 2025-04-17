import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
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
import { DuplicateLanguageInMultilingualTextError } from '../../../audio-visual/audio-item/errors/duplicate-language-in-multilingual-text.error';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Playlist } from '../../entities';
import { PlaylistCreated } from '../playlist-created.event';
import { TranslatePlaylistName } from './translate-playlist-name.command';

const commandType = 'TRANSLATE_PLAYLIST_NAME';

const playlistId = buildDummyUuid(1);

const playlistCompositeId = {
    type: AggregateType.playlist,
    id: playlistId,
};

const existingPlaylist = Playlist.fromEventHistory(
    new TestEventStream()
        .andThen<PlaylistCreated>({
            type: 'PLAYLIST_CREATED',
            payload: {
                name: 'original name of playlist',
                languageCodeForName: LanguageCode.Chilcotin,
            },
        })
        .as(playlistCompositeId),
    playlistId
) as Playlist;

const englishName = 'playlist name translated to English';

const validPayload: TranslatePlaylistName = {
    aggregateCompositeIdentifier: {
        type: AggregateType.playlist,
        id: existingPlaylist.id,
    },
    languageCode: LanguageCode.English,
    text: englishName,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<TranslatePlaylistName>> => validCommandFSA;

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

    const commandFSAFactory = new DummyCommandFsaFactory(() => validCommandFSA);

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.playlist]: [existingPlaylist],
                }).fetchFullSnapshotInLegacyFormat(),
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: playlistId },
                }: TranslatePlaylistName) => {
                    const playlistSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.playlist)
                        .fetchById(playlistId);

                    expect(playlistSearchResult).not.toBe(NotFound);

                    const playlist = playlistSearchResult as Playlist;

                    const englishTextItemSearchResult = playlist.name.getTranslation(
                        LanguageCode.English
                    );

                    expect(englishTextItemSearchResult).not.toBe(NotFound);

                    const englishTextItem = englishTextItemSearchResult as MultilingualTextItem;

                    expect(englishTextItem.text).toBe(englishName);

                    assertEventRecordPersisted(
                        playlist,
                        'PLAYLIST_NAME_TRANSLATED',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the playlist does not exist', () => {
            it('should fail with the expected errors', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
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

        describe('when the original name is in the target translation language', () => {
            it('should fail with the expected errors', async () => {
                const originalLanguageCode =
                    existingPlaylist.name.getOriginalTextItem().languageCode;

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () =>
                        clonePlainObjectWithOverrides(validCommandFSA, {
                            payload: {
                                languageCode: originalLanguageCode,
                            },
                        }),
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.playlist]: [existingPlaylist],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new DuplicateLanguageInMultilingualTextError(originalLanguageCode),
                            ])
                        );
                    },
                });
            });
        });

        describe('when the command payload type is invalid', () => {
            generateCommandFuzzTestCases(TranslatePlaylistName).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName, invalidValue },
                                commandFSAFactory.build(buildDummyUuid(789), {
                                    [propertyName]: invalidValue,
                                })
                            );
                        });
                    });
                }
            );
        });
    });
});
