import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Ack, CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { CannotAddDuplicateSetOfLyricsForSongError } from '../../errors';
import { Song } from '../../song.entity';
import { ADD_LYRICS_FOR_SONG } from '../translate-song-lyrics/constants';
import { AddLyricsForSong } from './add-lyrics-for-song.command';

const commandType = 'ADD_LYRICS_FOR_SONG';

const existingSong = getValidAggregateInstanceForTest(AggregateType.song).clone({
    lyrics: undefined,
});

const newEnglishLyrics = 'lalala';

const validPayload: AddLyricsForSong = {
    aggregateCompositeIdentifier: existingSong.getCompositeIdentifier(),
    lyrics: newEnglishLyrics,
    languageCode: LanguageCode.English,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<AddLyricsForSong>> => validCommandFSA;

// const dummyFsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    // let eventRepository: ArangoEventRepository;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
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

        // eventRepository = app.get(ArangoEventRepository);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    describe('When the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.song]: [existingSong],
                }).fetchFullSnapshotInLegacyFormat(),
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: SongId },
                }: AddLyricsForSong) => {
                    const songSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.song)
                        .fetchById(SongId);

                    expect(songSearchResult).not.toBe(NotFound);

                    const song = songSearchResult as Song;

                    expect(song.hasLyrics()).toBe(true);

                    assertEventRecordPersisted(song, `LYRICS_ADDED_FOR_SONG`, dummySystemUserId);
                },
            });
        });
    });

    describe(`When the command is invalid`, () => {
        describe(`when the song already has lyrics`, () => {
            it(`should fail with the expected errors`, async () => {
                const existingLyrics = 'existing lyrics';

                const lyricsLanguageCode = LanguageCode.Chilcotin;

                // const eventHistory = existingSong.eventHistory.concat(
                //     new LyricsAddedForSong(
                //         {
                //             aggregateCompositeIdentifier: existingSong.getCompositeIdentifier(),
                //         },
                //         buildDummyUuid(235),
                //         dummySystemUserId,
                //         // makeSure this is later than the create event
                //         dummyDateNow
                //     )
                // );

                // Arrange
                await testRepositoryProvider.addFullSnapshot(
                    new DeluxeInMemoryStore({
                        [AggregateType.song]: [existingSong],
                    }).fetchFullSnapshotInLegacyFormat()
                );

                const addLyricsFsa: CommandFSA<AddLyricsForSong> = {
                    type: ADD_LYRICS_FOR_SONG,
                    payload: {
                        aggregateCompositeIdentifier: existingSong.getCompositeIdentifier(),
                        lyrics: existingLyrics,
                        languageCode: lyricsLanguageCode,
                    },
                };

                // Add lyrics that will cause a collision
                const addFirstLyricsResult = await commandHandlerService.execute(addLyricsFsa, {
                    userId: dummySystemUserId,
                });

                expect(addFirstLyricsResult).toBe(Ack);

                // Act
                const attemptToAddDuplicateLyricsResult = await commandHandlerService.execute(
                    addLyricsFsa,
                    {
                        userId: dummySystemUserId,
                    }
                );

                assertErrorAsExpected(
                    attemptToAddDuplicateLyricsResult,
                    new CommandExecutionError([
                        new CannotAddDuplicateSetOfLyricsForSongError(existingSong),
                    ])
                );
            });
        });

        describe(`when the song with the given composite identifier does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: buildValidCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(existingSong.getCompositeIdentifier()),
                            ])
                        );
                    },
                });
            });
        });
    });
});
