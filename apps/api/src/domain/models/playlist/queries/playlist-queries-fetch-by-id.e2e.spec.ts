import {
    CoscradUserRole,
    HttpStatusCode,
    IDetailQueryResult,
    IPlayListViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { NoteRecordForResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import {
    PlaylistEpisodeViewModel,
    PlaylistViewModel,
} from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../types/AggregateId';
import { assertQueryResult } from '../../__tests__';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import {
    IPlaylistQueryRepository,
    PLAYLIST_QUERY_REPOSITORY_TOKEN,
} from './playlist-query-repository.interface';

const indexEndpoint = `/resources/playlists`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

const testUserThatIsAViewer = buildTestInstance(CoscradUser, {
    id: dummySystemUserId,
    roles: [CoscradUserRole.viewer],
});

// TODO Support user groups

const publicEpisode = buildTestInstance(PlaylistEpisodeViewModel, {
    isPublished: true,
    accessControlList: new AccessControlList(),
});

const privateEpisodeWithNoSpecialAccess = buildTestInstance(PlaylistEpisodeViewModel, {
    isPublished: false,
    accessControlList: new AccessControlList(),
});

const playlistName = 'Smooth Jazz';

const originalLanguageCode = LanguageCode.English;

const testNote = buildTestInstance(NoteRecordForResourceViewModel, {
    id: buildDummyUuid(101),
    note: {
        original: {
            text: 'this is the test note for the given playlist',
            languageCode: LanguageCode.English,
        },
        translations: {},
    },
});

const publishedPlaylistWithNoSpecialAccess = buildTestInstance(PlaylistViewModel, {
    accessControlList: new AccessControlList(),
    isPublished: true,
    name: buildMultilingualTextWithSingleItem(playlistName, originalLanguageCode),
    episodes: [publicEpisode, privateEpisodeWithNoSpecialAccess],
    notes: {
        [testNote.id]: testNote,
    },
});

describe(`when querying for a single playlist- by ID`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let playlistQueryRepository: IPlaylistQueryRepository;

    const setItUp = async (userWithGroups?: CoscradUserWithGroups) => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: testDatabaseName,
                BASE_URL: 'https://jaybam.com/home',
            },
            {
                testUserWithGroups: userWithGroups,
            }
        ));

        playlistQueryRepository = app.get(PLAYLIST_QUERY_REPOSITORY_TOKEN);
    };

    // let eventPublisher: ICoscradEventPublisher;
    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated (general public)`, () => {
        beforeAll(async () => {
            await setItUp();
        });

        describe(`when there is a playlist with the given ID`, () => {
            describe(`when the playlist has been published`, () => {
                it(`should return the playlist`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id),
                        seedInitialState: async () => {
                            await playlistQueryRepository.create(
                                clonePlainObjectWithOverrides(
                                    publishedPlaylistWithNoSpecialAccess,
                                    {
                                        episodes: [
                                            publicEpisode,
                                            privateEpisodeWithNoSpecialAccess,
                                        ],
                                    }
                                )
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async ({
                            episodes,
                        }: IDetailQueryResult<PlaylistViewModel>) => {
                            // The public user should only have access to the public episode
                            // expect(episodes).toHaveLength(1);

                            // we need an event consumer to publish playlist episodes
                            // for now, all audio items are considered public if added to a playlist
                            expect(episodes).toHaveLength(2);
                        },
                    });

                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id)
                    );

                    expect(res.status).toBe(httpStatusCodes.ok);

                    // Commands should not be visible to ordinary users
                    expect(res.body.actions).toEqual([]);
                });
            });

            describe(`when the playlist has not been published`, () => {
                beforeEach(async () => {
                    await playlistQueryRepository.create(
                        buildTestInstance(PlaylistViewModel, {
                            id: publishedPlaylistWithNoSpecialAccess.id,
                            isPublished: false,
                        })
                    );
                });

                it(`should return not found`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id)
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });

        describe(`when there is no playlist with the given ID`, () => {
            it(`should return not found`, async () => {
                // can we share this test case with other user cases?
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(buildDummyUuid(157)),
                    expectedStatus: HttpStatusCode.notFound,
                    seedInitialState: async () => {
                        await playlistQueryRepository.create(publishedPlaylistWithNoSpecialAccess);
                    },
                });
            });
        });
    });

    describe(`when the user is authenticated as a regular viewer (non-admin)`, () => {
        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(testUserThatIsAViewer, []));
        });

        describe(`when the playlist is public`, () => {
            it(`should return the expected result`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id),
                    seedInitialState: async () => {
                        await playlistQueryRepository.create(
                            clonePlainObjectWithOverrides(publishedPlaylistWithNoSpecialAccess, {
                                episodes: [
                                    publicEpisode,
                                    privateEpisodeWithNoSpecialAccess,
                                    clonePlainObjectWithOverrides(
                                        privateEpisodeWithNoSpecialAccess,
                                        {
                                            accessControlList: new AccessControlList().allowUser(
                                                testUserThatIsAViewer.id
                                            ),
                                        }
                                    ),
                                ],
                            })
                        );
                    },
                    expectedStatus: HttpStatusCode.ok,
                    checkResponseBody: async (body: IDetailQueryResult<IPlayListViewModel>) => {
                        // ordinary users cannot execute actions
                        expect(body.actions).toEqual([]);

                        /**
                         * TODO support separate publication of playlist episodes
                         *
                         * The user should see the public episode and the
                         * private episode for which they are in the ACL, but not
                         * the other private episode.
                         */
                        // expect(body.episodes).toHaveLength(2);

                        expect(body.episodes).toHaveLength(3);
                    },
                });
            });
        });

        describe(`when the playlist is private`, () => {
            describe(`when the user is not in the query ACL`, () => {
                it(`should return not found`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id),
                        seedInitialState: async () => {
                            await playlistQueryRepository.create(
                                clonePlainObjectWithOverrides(
                                    publishedPlaylistWithNoSpecialAccess,
                                    {
                                        isPublished: false,
                                    }
                                )
                            );
                        },
                        expectedStatus: HttpStatusCode.notFound,
                    });
                });
            });

            describe(`when the user appears in the query ACL as a user`, () => {
                it(`should return the expected result`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id),
                        seedInitialState: async () => {
                            await playlistQueryRepository.create(
                                clonePlainObjectWithOverrides(
                                    publishedPlaylistWithNoSpecialAccess,
                                    {
                                        accessControlList: new AccessControlList().allowUser(
                                            testUserThatIsAViewer.id
                                        ),
                                    }
                                )
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (body: IDetailQueryResult<IPlayListViewModel>) => {
                            // ordinary users cannot execute actions
                            expect(body.actions).toEqual([]);
                        },
                    });
                });
            });

            describe(`when the user appears in the query ACL as a group member`, () => {
                // TODO We don't yet support this use case
                it.todo(`should return the expected result`);
            });
        });
    });

    describe(`when the user is a COSCRAD admin`, () => {
        const coscradAdmin = testUserThatIsAViewer.clone({
            roles: [CoscradUserRole.superAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(coscradAdmin, []));
        });

        describe(`when there is a playlist with the given ID`, () => {
            describe(`when the playlist is public`, () => {
                it(`should return the expected result`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id),
                        seedInitialState: async () => {
                            await playlistQueryRepository.create(
                                publishedPlaylistWithNoSpecialAccess
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (body: IDetailQueryResult<IPlayListViewModel>) => {
                            // a COSCRAD admin can execute actions
                            expect(body.actions).not.toEqual([]);

                            // we included 1 public and 1 private episode- an admin should see both
                            expect(body.episodes).toHaveLength(2);

                            // TODO Add some notes and check that ACL is respected for notes

                            /**
                             * We snapshot just one response as a contract test
                             * for the `by ID` query endpoint for playlists.
                             * We do this with the `Coscrad Admin` case because this
                             * will also capture the structure of properties such
                             * as `actions`, which are only visible to admin
                             */
                            expect(body).toMatchSnapshot();
                        },
                    });
                });
            });

            describe(`when the playlist is private`, () => {
                it(`should return the expected result`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id),
                        seedInitialState: async () => {
                            await playlistQueryRepository.create(
                                clonePlainObjectWithOverrides(
                                    publishedPlaylistWithNoSpecialAccess,
                                    {
                                        isPublished: false,
                                    }
                                )
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (body: IDetailQueryResult<IPlayListViewModel>) => {
                            // ordinary users cannot execute actions
                            expect(body.actions).not.toEqual([]);

                            /**
                             * We snapshot just one response as a contract test
                             * for the `by ID` query endpoint for playlists.
                             * We do this with the `Coscrad Admin` case because this
                             * will also capture the structure of properties such
                             * as `actions`, which are only visible to admin
                             */
                            expect(body).toMatchSnapshot();
                        },
                    });
                });
            });
        });

        describe(`when there is no playlist with the given ID`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(buildDummyUuid(345)),
                    seedInitialState: async () => {
                        await playlistQueryRepository.create(publishedPlaylistWithNoSpecialAccess);
                    },
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        const projectAdmin = testUserThatIsAViewer.clone({
            roles: [CoscradUserRole.projectAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(projectAdmin, []));
        });

        describe(`when there is a playlist with the given ID`, () => {
            describe(`when the playlist is public`, () => {
                it(`should return the expected result`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id),
                        seedInitialState: async () => {
                            await playlistQueryRepository.create(
                                publishedPlaylistWithNoSpecialAccess
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (body: IDetailQueryResult<IPlayListViewModel>) => {
                            // admin users have access to actions
                            expect(body.actions).not.toEqual([]);

                            // we included 1 public and 1 private episode- an admin should see both
                            expect(body.episodes).toHaveLength(2);
                        },
                    });
                });
            });

            describe(`when the playlist is private`, () => {
                it(`should return the expected result`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(publishedPlaylistWithNoSpecialAccess.id),
                        seedInitialState: async () => {
                            await playlistQueryRepository.create(
                                clonePlainObjectWithOverrides(
                                    publishedPlaylistWithNoSpecialAccess,
                                    {
                                        isPublished: false,
                                    }
                                )
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                        checkResponseBody: async (body: IDetailQueryResult<IPlayListViewModel>) => {
                            // ordinary users cannot execute actions
                            expect(body.actions).not.toEqual([]);

                            /**
                             * We snapshot just one response as a contract test
                             * for the `by ID` query endpoint for playlists.
                             * We do this with the `Coscrad Admin` case because this
                             * will also capture the structure of properties such
                             * as `actions`, which are only visible to admin
                             */
                            expect(body).toMatchSnapshot();
                        },
                    });
                });
            });
        });

        describe(`when there is no playlist with the given ID`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(buildDummyUuid(345)),
                    seedInitialState: async () => {
                        await playlistQueryRepository.create(publishedPlaylistWithNoSpecialAccess);
                    },
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });
});
