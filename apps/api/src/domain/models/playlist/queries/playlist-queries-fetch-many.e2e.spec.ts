import {
    CoscradUserRole,
    HttpStatusCode,
    IIndexQueryResult,
    IPlayListViewModel,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { CoscradContributorViewModel } from '../../../../queries/buildViewModelForResource/viewModels/coscrad-contributor.view-model';
import {
    PlaylistEpisodeViewModel,
    PlaylistViewModel,
} from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { assertQueryResult } from '../../__tests__';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import { ArangoPlaylistQueryRepository } from './arango-playlist-query-repository';
import { IPlaylistQueryRepository } from './playlist-query-repository.interface';

const indexEndpoint = `/resources/playlists`;

const ordinaryUser = buildTestInstance(CoscradUser, {
    roles: [CoscradUserRole.viewer],
});

const publicEpisode = buildTestInstance(PlaylistEpisodeViewModel, {
    isPublished: true,
    name: buildMultilingualTextWithSingleItem('public episode'),
});

const privateEpisode = buildTestInstance(PlaylistEpisodeViewModel, {
    isPublished: false,
    name: buildMultilingualTextWithSingleItem('private episode'),
});

const unpublishedEpisodeWithAclAccessForOrdinaryUser = buildTestInstance(PlaylistEpisodeViewModel, {
    isPublished: false,
    accessControlList: new AccessControlList().allowUser(ordinaryUser.id),
    name: buildMultilingualTextWithSingleItem('unpublished episode with ACL access for viewer'),
});

const testContributor = buildTestInstance(CoscradContributorViewModel);

const contributions = [testContributor];

// + ALL
const publicPlaylist = buildTestInstance(PlaylistViewModel, {
    id: buildDummyUuid(1),
    isPublished: true,
    name: buildMultilingualTextWithSingleItem('public playlist'),
    episodes: [publicEpisode, privateEpisode, unpublishedEpisodeWithAclAccessForOrdinaryUser],
    contributions,
});

// - publicUser, - ordinaryUser, + admin
const privatePlaylist = buildTestInstance(PlaylistViewModel, {
    id: buildDummyUuid(2),
    isPublished: false,
    // no special access
    queryAccessControlList: new AccessControlList(),
    contributions,
});

// - publicUser, + ordinaryUser, + admin
const unpublishedPlaylistWithAclAccessForOrdinaryUser = buildTestInstance(PlaylistViewModel, {
    id: buildDummyUuid(3),
    isPublished: false,
    queryAccessControlList: new AccessControlList().allowUser(ordinaryUser.id),
    contributions,
});

const allPlaylists = [
    publicPlaylist,
    privatePlaylist,
    unpublishedPlaylistWithAclAccessForOrdinaryUser,
];

describe(`when querying for a playlist: fetch many (${indexEndpoint})`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let connectionProvider: ArangoConnectionProvider;

    let playlistQueryRepository: IPlaylistQueryRepository;

    const seedInitialState = async () => {
        await playlistQueryRepository.createMany(allPlaylists);
    };

    const setItUp = async (testUserWithGroups?: CoscradUserWithGroups) => {
        // TODO avoid using `setUpIntegrationTest` here
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: testDatabaseName,
            },
            {
                testUserWithGroups,
            }
            // no authenticated user
        ));

        connectionProvider = app.get(ArangoConnectionProvider);

        playlistQueryRepository = new ArangoPlaylistQueryRepository(connectionProvider);
    };

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        databaseProvider.close();

        await app.close();
    });

    describe(`when the user is not authenticated (public user)`, () => {
        beforeAll(async () => {
            await setItUp();
        });

        it(`it should return only public vocabulary lists and episodes`, async () => {
            await assertQueryResult({
                app,
                endpoint: indexEndpoint,
                expectedStatus: HttpStatusCode.ok,
                seedInitialState,
                checkResponseBody: async (body: IIndexQueryResult<IPlayListViewModel>) => {
                    // The public user can only see 1 of the 3 playlists
                    expect(body.entities).toHaveLength(1);

                    // similiarly, the public user can see 1 of 3 episodes
                    expect(body.entities[0].episodes).toHaveLength(1);

                    expect(body.indexScopedActions).toHaveLength(0);

                    const entitiesWithAvailableActions = body.entities.filter(
                        ({ actions }) => Array.isArray(actions) && actions.length > 0
                    );

                    expect(entitiesWithAvailableActions).toEqual([]);
                },
            });
        });
    });

    describe(`when the user is authenticated as an ordinary user (viewer)`, () => {
        beforeAll(async () => {
            // TODO support user group based access control
            await setItUp(new CoscradUserWithGroups(ordinaryUser, []));
        });

        it(`it should return playlists and episodes that are public or have the user in the ACL`, async () => {
            await assertQueryResult({
                app,
                endpoint: indexEndpoint,
                expectedStatus: HttpStatusCode.ok,
                seedInitialState,
                checkResponseBody: async (body: IIndexQueryResult<IPlayListViewModel>) => {
                    // The viewer user can see the public playlist and the playlist with their user ID in the ACL
                    expect(body.entities).toHaveLength(2);

                    // The viewer user can see the public episode and the episode with their user ID in the ACL
                    expect(body.entities[0].episodes).toHaveLength(2);

                    expect(body.indexScopedActions).toHaveLength(0);

                    const entitiesWithAvailableActions = body.entities.filter(
                        ({ actions }) => Array.isArray(actions) && actions.length > 0
                    );

                    expect(entitiesWithAvailableActions).toEqual([]);
                },
            });
        });
    });

    describe(`when the user is authenticated as a COSCRAD admin`, () => {
        beforeAll(async () => {
            await setItUp(
                new CoscradUserWithGroups(
                    ordinaryUser.clone({
                        roles: [CoscradUserRole.superAdmin],
                    }),
                    []
                )
            );
        });

        it(`it should return playlists and episodes that are public or have the user in the ACL`, async () => {
            await assertQueryResult({
                app,
                endpoint: indexEndpoint,
                expectedStatus: HttpStatusCode.ok,
                seedInitialState,
                checkResponseBody: async (body: IIndexQueryResult<IPlayListViewModel>) => {
                    // an admin can see all playlists
                    expect(body.entities).toHaveLength(3);

                    // an admin can see all episodes
                    expect(body.entities[0].episodes).toHaveLength(3);

                    expect(body.indexScopedActions).not.toHaveLength(0);

                    const entitiesWithAvailableActions = body.entities.filter(
                        ({ actions }) => Array.isArray(actions) && actions.length > 0
                    );

                    expect(entitiesWithAvailableActions).toHaveLength(3);

                    /**
                     * We snapshot one and only one response as a test of the
                     * contract with the client. We choose the admin case
                     * because it includes `actions`.
                     */
                    expect(body).toMatchSnapshot();
                },
            });
        });
    });

    describe(`when the user is authenticated as a project admin`, () => {
        beforeAll(async () => {
            await setItUp(
                new CoscradUserWithGroups(
                    ordinaryUser.clone({
                        roles: [CoscradUserRole.projectAdmin],
                    }),
                    []
                )
            );
        });

        it(`it should return playlists and episodes that are public or have the user in the ACL`, async () => {
            await assertQueryResult({
                app,
                endpoint: indexEndpoint,
                expectedStatus: HttpStatusCode.ok,
                seedInitialState,
                checkResponseBody: async (body: IIndexQueryResult<IPlayListViewModel>) => {
                    // an admin can see all playlists
                    expect(body.entities).toHaveLength(3);

                    // an admin can see all episodes
                    expect(body.entities[0].episodes).toHaveLength(3);

                    expect(body.indexScopedActions).not.toHaveLength(0);

                    const entitiesWithAvailableActions = body.entities.filter(
                        ({ actions }) => Array.isArray(actions) && actions.length > 0
                    );

                    expect(entitiesWithAvailableActions).toHaveLength(3);
                },
            });
        });
    });
});
