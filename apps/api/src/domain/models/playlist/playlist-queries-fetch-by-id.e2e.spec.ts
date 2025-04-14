import {
    CoscradUserRole,
    HttpStatusCode,
    IDetailQueryResult,
    IPlayListViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { clonePlainObjectWithOverrides } from 'apps/api/src/lib/utilities/clonePlainObjectWithOverrides';
import * as request from 'supertest';
import httpStatusCodes from '../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../types/AggregateId';
import { assertQueryResult } from '../__tests__';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../__tests__/utilities/dummySystemUserId';
import { AccessControlList } from '../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../user-management/user/entities/user/coscrad-user.entity';
import { PlaylistViewModel } from './playlist.view-model';
import { IPlaylistQueryRepository, PLAYLIST_QUERY_REPOSITORY_TOKEN } from './queries';

const indexEndpoint = `/resources/playlists`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

const testUserThatIsAViewer = buildTestInstance(CoscradUser, {
    id: dummySystemUserId,
    roles: [CoscradUserRole.viewer],
});

// TODO Support user groups
const _dummyUserWithGroups = new CoscradUserWithGroups(testUserThatIsAViewer, []);

const playlistName = 'Smooth Jazz';

const originalLanguageCode = LanguageCode.English;

const publishedPlaylistWithNoSpecialAccess = buildTestInstance(PlaylistViewModel, {
    queryAccessControlList: new AccessControlList(),
    isPublished: true,
    name: buildMultilingualTextWithSingleItem(playlistName, originalLanguageCode),
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
                beforeEach(async () => {
                    await playlistQueryRepository.create(publishedPlaylistWithNoSpecialAccess);
                });

                it(`should return the playlist`, async () => {
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
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(buildDummyUuid(157)),
                    expectedStatus: HttpStatusCode.ok,
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
                        await playlistQueryRepository.create(publishedPlaylistWithNoSpecialAccess);
                    },
                    expectedStatus: HttpStatusCode.ok,
                    checkResponseBody: async (body: IDetailQueryResult<IPlayListViewModel>) => {
                        // ordinary users cannot execute actions
                        expect(body.actions).toEqual([]);
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
                                        queryAccessControlList: new AccessControlList().allowUser(
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
        describe(`when there is a playlist with the given ID`, () => {
            describe(`when the playlist is public`, () => {
                it.todo(`should return the expected result`);
            });

            describe(`when the playlist is private`, () => {
                describe(`when the user is not in the query ACL`, () => {
                    it.todo(`should return not found`);
                });

                describe(`when the user appears in the query ACL as a user`, () => {
                    it.todo(`should return the expected result`);
                });

                describe(`when the user appears in the query ACL as a group member`, () => {
                    // TODO We don't yet support this use case
                    it.todo(`should return the expected result`);
                });
            });
        });

        describe(`when there is no playlist with the given ID`, () => {
            it.todo(`should have a test`);
        });
    });

    describe(`when the user is a project admin`, () => {
        describe(`when there is a playlist with the given ID`, () => {
            it.todo(`should have a test`);
        });

        describe(`when there is no playlist with the given ID`, () => {
            it.todo(`should have a test`);
        });
    });
});
