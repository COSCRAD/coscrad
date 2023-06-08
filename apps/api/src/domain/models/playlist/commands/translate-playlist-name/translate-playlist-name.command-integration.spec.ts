import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import assertErrorAsExpected from 'apps/api/src/lib/__tests__/assertErrorAsExpected';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { NotFound } from '../../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Playlist } from '../../entities';
import { TranslatePlaylistName } from './translate-playlist-name.command';

const commandType = 'TRANSLATE_PLAYLIST_NAME';

const existingPlaylist = getValidAggregateInstanceForTest(AggregateType.playlist).clone({
    name: new MultilingualText({
        items: [
            new MultilingualTextItem({
                text: 'original name of playlist',
                role: MultilingualTextItemRole.original,
                languageCode: LanguageCode.Chilcotin,
            }),
        ],
    }),
});

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

                    const englishTextItem = playlist.name.items.find(
                        ({ languageCode }) => languageCode === LanguageCode.English
                    );

                    expect(englishTextItem.text).toBe(englishName);
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the playlist already exists', () => {
            it('should fail with the expected errors',async () => {
                return await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.playlist]: [existingPlaylist]
                }).fetchFullSnapshotInLegacyFormat(),
                checkError: (error) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([
                            new CannotAddDuplicateNameOfPlaylist(
                                existingPlaylist
                            )
                        ])
                    )
                }
            })
        })
    });
});
