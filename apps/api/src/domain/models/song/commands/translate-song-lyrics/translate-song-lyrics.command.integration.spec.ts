import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { isNotFound } from '../../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../common/entities/multilingual-text';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { NoLyricsToTranslateError } from '../../errors';
import { SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError } from '../../errors/SongLyricsAlreadyHaveBeenTranslatedToGivenLanguageError';
import { Song } from '../../song.entity';
import { TranslateSongLyrics } from './translate-song-lyrics.command';

const commandType = 'TRANSLATE_SONG_LYRICS';

const existingLyricsLanguage = LanguageCode.Haida;

const translation = 'vocables only';

const translationLanguageCode = LanguageCode.English;

const existingLyrics = buildMultilingualTextWithSingleItem('falalala', existingLyricsLanguage);

const existingSong = getValidAggregateInstanceForTest(AggregateType.song).clone({
    lyrics: existingLyrics,
});

const buildValidCommandFSA = (): FluxStandardAction<DTO<TranslateSongLyrics>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: existingSong.getCompositeIdentifier(),
        translation,
        languageCode: translationLanguageCode,
    },
});

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

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
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.deleteAllResourcesOfGivenType(AggregateType.song);
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates to the database`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.song]: [existingSong],
                }).fetchFullSnapshotInLegacyFormat(),
                buildValidCommandFSA,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: songId },
                    languageCode,
                }: TranslateSongLyrics) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.song)
                        .fetchById(songId);

                    expect(searchResult).toBeInstanceOf(Song);

                    const song = searchResult as Song;

                    const doesSongHaveTranslation = !isNotFound(
                        song.lyrics.translate(languageCode)
                    );

                    expect(doesSongHaveTranslation).toBe(true);

                    assertEventRecordPersisted(song, `SONG_LYRICS_TRANSLATED`, dummySystemUserId);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
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

        describe(`when the song does not have any lyrics to translate`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.song]: [
                            existingSong.clone({
                                lyrics: undefined,
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: buildValidCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([new NoLyricsToTranslateError(existingSong)])
                        );
                    },
                });
            });
        });

        describe(`when the song already has a translation in the given language`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.song]: [
                            existingSong.clone({
                                lyrics: existingLyrics.append(
                                    new MultilingualTextItem({
                                        text: translation,
                                        languageCode: translationLanguageCode,
                                        role: MultilingualTextItemRole.freeTranslation,
                                    })
                                ),
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: buildValidCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new SongLyricsHaveAlreadyBeenTranslatedToGivenLanguageError(
                                    existingSong,
                                    translationLanguageCode
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
