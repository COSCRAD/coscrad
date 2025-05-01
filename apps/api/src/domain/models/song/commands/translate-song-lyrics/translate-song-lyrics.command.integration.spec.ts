import { AggregateType, FluxStandardAction, LanguageCode } from '@coscrad/api-interfaces';
import { Ack, CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { isNotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../../types/AggregateId';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { AudioItemCreated } from '../../../audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { NoLyricsToTranslateError } from '../../errors';
import { SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError } from '../../errors/SongLyricsAlreadyHaveBeenTranslatedToGivenLanguageError';
import { Song } from '../../song.entity';
import { AddLyricsForSong } from '../add-lyrics-for-song';
import { CreateSong } from '../create-song.command';
import { ADD_LYRICS_FOR_SONG } from './constants';
import { TranslateSongLyrics } from './translate-song-lyrics.command';

const commandType = 'TRANSLATE_SONG_LYRICS';

const existingLyricsLanguage = LanguageCode.Haida;

const translation = 'vocables only';

const translationLanguageCode = LanguageCode.English;

const existingLyrics = buildMultilingualTextWithSingleItem('falalala', existingLyricsLanguage);

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<TranslateSongLyrics>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id,
        },
        translation,
        languageCode: translationLanguageCode,
    },
});

const dummyCreateSongFsa = buildTestCommandFsaMap().get(`CREATE_SONG`) as CommandFSA<CreateSong>;

const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
});

const eventHistoryForAudioItem = audioItemCreated.as({
    type: AggregateType.audioItem,
    id: dummyCreateSongFsa.payload.audioItemId,
});

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

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates to the database`, async () => {
            // Arrange
            const generatedId = await idManager.generate();

            await app.get(ArangoEventRepository).appendEvents(eventHistoryForAudioItem);

            const createSongFsa = clonePlainObjectWithOverrides(dummyCreateSongFsa, {
                payload: { aggregateCompositeIdentifier: { id: generatedId } },
            });

            const commandMeta = { userId: dummySystemUserId };

            const createResult = await commandHandlerService.execute(createSongFsa, commandMeta);

            expect(createResult).toBe(Ack);

            const addLyricsCommand: AddLyricsForSong = {
                aggregateCompositeIdentifier: {
                    type: AggregateType.song,
                    id: generatedId,
                },
                lyrics: existingLyrics.getOriginalTextItem().text,
                languageCode: existingLyricsLanguage,
            };

            const addLyricsResult = await commandHandlerService.execute(
                {
                    type: ADD_LYRICS_FOR_SONG,
                    payload: addLyricsCommand,
                },
                commandMeta
            );

            expect(addLyricsResult).toBe(Ack);

            // TODO rename
            const validFsa = buildValidCommandFSA(generatedId);

            // Act
            const result = await commandHandlerService.execute(validFsa, commandMeta);

            // Assert
            // verify command status
            expect(result).toBe(Ack);

            // check state on success
            const searchResult = await testRepositoryProvider
                .forResource(AggregateType.song)
                .fetchById(validFsa.payload.aggregateCompositeIdentifier.id);

            expect(searchResult).toBeInstanceOf(Song);

            const song = searchResult as Song;

            const doSongLyricsHaveTranslation = !isNotFound(
                song.lyrics.getTranslation(translationLanguageCode)
            );

            expect(doSongLyricsHaveTranslation).toBe(true);

            assertEventRecordPersisted(song, `SONG_LYRICS_TRANSLATED`, dummySystemUserId);
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the song with the given composite identifier does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                const unknownId = buildDummyUuid(123);

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        return Promise.resolve();
                    },
                    buildCommandFSA: () => buildValidCommandFSA(unknownId),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError({
                                    type: AggregateType.song,
                                    id: unknownId,
                                }),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the song does not have any lyrics to translate`, () => {
            it(`should fail with the expected errors`, async () => {
                const newId = await idManager.generate();

                const validCommandFsa = buildValidCommandFSA(newId);

                await app.get(ArangoEventRepository).appendEvents(eventHistoryForAudioItem);

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    // Create the song without adding any lyrics
                    seedInitialState: async () => {
                        const createSongFsa = clonePlainObjectWithOverrides(dummyCreateSongFsa, {
                            payload: { aggregateCompositeIdentifier: { id: newId } },
                        });

                        const commandMeta = { userId: dummySystemUserId };

                        const createResult = await commandHandlerService.execute(
                            createSongFsa,
                            commandMeta
                        );

                        expect(createResult).toBe(Ack);
                    },
                    buildCommandFSA: () => validCommandFsa,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([new NoLyricsToTranslateError(newId)])
                        );
                    },
                });
            });
        });

        describe(`when the song already has a translation in the given language`, () => {
            it(`should fail with the expected errors`, async () => {
                const newId = await idManager.generate();

                const commandFsa = buildValidCommandFSA(newId);

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        const createSongFsa = clonePlainObjectWithOverrides(dummyCreateSongFsa, {
                            payload: { aggregateCompositeIdentifier: { id: newId } },
                        });

                        const commandMeta = { userId: dummySystemUserId };

                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForAudioItem);

                        // create the song
                        const createResult = await commandHandlerService.execute(
                            createSongFsa,
                            commandMeta
                        );

                        expect(createResult).toBe(Ack);

                        const addLyricsCommand: AddLyricsForSong = {
                            aggregateCompositeIdentifier: {
                                type: AggregateType.song,
                                id: newId,
                            },
                            lyrics: existingLyrics.getOriginalTextItem().text,
                            languageCode: existingLyricsLanguage,
                        };

                        // add song lyrics
                        const addLyricsResult = await commandHandlerService.execute(
                            {
                                type: ADD_LYRICS_FOR_SONG,
                                payload: addLyricsCommand,
                            },
                            commandMeta
                        );

                        expect(addLyricsResult).toBe(Ack);

                        // translate lyrics for the first time
                        const firstTranslateLyricsResult = await commandHandlerService.execute(
                            commandFsa,
                            commandMeta
                        );

                        expect(firstTranslateLyricsResult).toBe(Ack);
                    },
                    buildCommandFSA: () => commandFsa,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError(
                                    newId,
                                    translationLanguageCode
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe('when the command payload type is invalid', () => {
            generateCommandFuzzTestCases(TranslateSongLyrics).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSA(buildDummyUuid(34))
                            );
                        });
                    });
                }
            );
        });
    });
});
