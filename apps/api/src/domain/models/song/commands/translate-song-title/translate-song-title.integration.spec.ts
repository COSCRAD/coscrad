import {
    AggregateType,
    ICommandBase,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../../../../domain/common/entities/errors';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { isNotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Song } from '../../song.entity';
import { SongCreated } from '../song-created.event';
import { TranslateSongTitle } from './translate-song-title.command';

const commandType = 'TRANSLATE_SONG_TITLE';

const originalTitleText = 'original title';

const existingTitle = buildMultilingualTextWithSingleItem(originalTitleText, LanguageCode.English);

const dummySong = getValidAggregateInstanceForTest(AggregateType.song);

// TODO Seed state from a command stream instead
const existingSong = dummySong.clone({
    title: existingTitle,
    eventHistory: [
        // TODO make sure the dates are consistent
        new SongCreated(
            {
                aggregateCompositeIdentifier: dummySong.getCompositeIdentifier(),
                title: existingTitle.getOriginalTextItem().text,
                languageCodeForTitle: existingTitle.getOriginalTextItem().languageCode,
                audioURL: dummySong.audioURL,
                // TODO Make BaseEvent generic ?
            } as ICommandBase,
            buildDummyUuid(111),
            dummySystemUserId,
            dummyDateNow
        ),
    ],
});

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<TranslateSongTitle>;

const translationText = 'title in chilcotin';

const translationLanguageCode = LanguageCode.Chilcotin;

const validFsa = clonePlainObjectWithOverrides(dummyFsa, {
    payload: {
        aggregateCompositeIdentifier: existingSong.getCompositeIdentifier(),
        translation: translationText,
        languageCode: translationLanguageCode,
    },
});

const buildValidCommandFSA = () => validFsa;

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
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.song]: [existingSong],
                }).fetchFullSnapshotInLegacyFormat(),
                buildValidCommandFSA,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: songId },
                    languageCode,
                }: TranslateSongTitle) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.song)
                        .fetchById(songId);

                    expect(searchResult).toBeInstanceOf(Song);

                    const song = searchResult as Song;

                    const doesSongTitleHaveTranslation = !isNotFound(
                        song.title.getTranslation(languageCode)
                    );

                    expect(doesSongTitleHaveTranslation).toBe(true);

                    assertEventRecordPersisted(song, `SONG_TITLE_TRANSLATED`, dummySystemUserId);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when there is already a translation in the given language`, () => {
            const existingItem = new MultilingualTextItem({
                text: translationText,
                languageCode: translationLanguageCode,
                role: MultilingualTextItemRole.freeTranslation,
            });

            const existingMultilingualText = existingTitle.translate(
                existingItem
            ) as MultilingualText;

            it('should fail with the expected error', async () => {
                await testRepositoryProvider.addFullSnapshot(
                    new DeluxeInMemoryStore({
                        [AggregateType.song]: [
                            existingSong.clone({
                                title: existingMultilingualText,
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat()
                );

                // Translate the song once
                await commandHandlerService.execute(buildValidCommandFSA(), {
                    userId: dummySystemUserId,
                });

                const result = await commandHandlerService.execute(buildValidCommandFSA(), {
                    userId: dummySystemUserId,
                });

                assertErrorAsExpected(
                    result,
                    new CommandExecutionError([
                        new CannotAddDuplicateTranslationError(
                            new MultilingualTextItem({
                                text: translationText,
                                languageCode: translationLanguageCode,
                                role: MultilingualTextItemRole.freeTranslation,
                            }),
                            existingMultilingualText
                        ),
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

        describe('when the command payload type is invalid', () => {
            generateCommandFuzzTestCases(TranslateSongTitle).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName, invalidValue },
                                validFsa
                            );
                        });
                    });
                }
            );
        });
    });
});
