import { LanguageCode, MultilingualTextItemRole, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../types/DTO';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummyUuid } from '../../__tests__/utilities/dummyUuid';
import { Playlist } from '../entities';
import { CreatePlayList } from './create-playlist.command';

const commandType = 'CREATE_PLAYLIST';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreatePlayList>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.playlist },
        name: new MultilingualText({
            items: [],
        })
            .append(
                new MultilingualTextItem({
                    languageCode: LanguageCode.Chilcotin,
                    role: MultilingualTextItemRole.original,
                    text: 'dummy playlist name',
                })
            )
            .toDTO(),
    },
});

const emptyInitialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

const dummyAdminUserId = dummyUuid;

//TODO insure that an invaild multilingual test name property fails
describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
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
});
