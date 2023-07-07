import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { CannotAddDuplicateSetOfLyricsForSongError } from '../../errors';
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

    beforeAll(async () => {
        await testRepositoryProvider.testSetup();
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
                },
            });
        });
    });

    describe(`When the command is invalid`, () => {
        describe(`when the song already has lyrics`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.song]: [
                            existingSong.clone({
                                lyrics: buildMultilingualTextWithSingleItem(
                                    'existing lyrics',
                                    LanguageCode.Chilcotin
                                ),
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: buildValidCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddDuplicateSetOfLyricsForSongError(existingSong),
                            ])
                        );
                    },
                });
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
