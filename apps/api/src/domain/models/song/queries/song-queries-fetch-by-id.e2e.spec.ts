import { CoscradUserRole, HttpStatusCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../test-data/utilities';
import { AggregateId } from '../../../types/AggregateId';
import { assertQueryResult } from '../../__tests__';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import {
    ISongQueryRepository,
    SONG_QUERY_REPOSITORY_TOKEN,
} from './song-query-repository.interface';
import { EventSourcedSongViewModel } from './song.view-model.event.sourced';

const indexEndpoint = `/resources/songs`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

const songId = buildDummyUuid(1);

describe(`when querying songs: fetch by ID`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let songQueryRepository: ISongQueryRepository;

    const setItUp = async (userWithGroups?: CoscradUserWithGroups) => {
        // TODO Can we avoid this here?
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: testDatabaseName,
                BASE_URL: 'https://jaybam.com/home',
            },
            {
                testUserWithGroups: userWithGroups,
            }
        ));

        songQueryRepository = app.get(SONG_QUERY_REPOSITORY_TOKEN);
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
            // no mock user
            await setItUp();
        });

        describe(`when there is an song with the given ID`, () => {
            describe(`when the song is public`, () => {
                it(`should return the song`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(songId),
                        seedInitialState: async () => {
                            await songQueryRepository.create(
                                buildTestInstance(EventSourcedSongViewModel, {
                                    id: songId,
                                    isPublished: true,
                                    accessControlList: new AccessControlList(),
                                })
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                    });
                });
            });

            describe(`when the song is not public`, () => {
                it(`should return not found`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(songId),
                        seedInitialState: async () => {
                            await songQueryRepository.create(
                                buildTestInstance(EventSourcedSongViewModel, {
                                    id: songId,
                                    isPublished: false,
                                    accessControlList: new AccessControlList(),
                                })
                            );
                        },
                        expectedStatus: HttpStatusCode.notFound,
                    });
                });
            });
        });

        describe(`when there is no song with the given ID`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(songId),
                    seedInitialState: async () => {
                        Promise.resolve();
                    },
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });

    describe(`when the user is authenticated as an ordinary viewer`, () => {
        const testUser = buildTestInstance(CoscradUser, {
            id: buildDummyUuid(77),
            roles: [CoscradUserRole.viewer],
        });

        const testUserWithGroups = new CoscradUserWithGroups(testUser, []);

        beforeAll(async () => {
            await setItUp(testUserWithGroups);
        });

        describe(`when there is a song with the given ID`, () => {
            describe(`when the song is public`, () => {
                it(`should return the song`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(songId),
                        seedInitialState: async () => {
                            await songQueryRepository.create(
                                buildTestInstance(EventSourcedSongViewModel, {
                                    id: songId,
                                    isPublished: true,
                                    accessControlList: new AccessControlList(),
                                })
                            );
                        },
                        expectedStatus: HttpStatusCode.ok,
                    });
                });
            });

            describe(`when the song is not public`, () => {
                describe(`when the user is in the song's ACL`, () => {
                    it(`should return the song`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(songId),
                            seedInitialState: async () => {
                                await songQueryRepository.create(
                                    buildTestInstance(EventSourcedSongViewModel, {
                                        id: songId,
                                        isPublished: false,
                                        accessControlList: new AccessControlList().allowUser(
                                            testUserWithGroups.id
                                        ),
                                    })
                                );
                            },
                            expectedStatus: HttpStatusCode.ok,
                        });
                    });
                });

                describe(`when the user is not in the song's ACL`, () => {
                    it(`should return not found`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(songId),
                            seedInitialState: async () => {
                                await songQueryRepository.create(
                                    buildTestInstance(EventSourcedSongViewModel, {
                                        id: songId,
                                        isPublished: false,
                                        accessControlList: new AccessControlList(),
                                    })
                                );
                            },
                            expectedStatus: HttpStatusCode.notFound,
                        });
                    });
                });
            });
        });

        describe(`when there is no song with the given ID`, () => {
            it(`should return not found`, async () => {
                await assertQueryResult({
                    app,
                    endpoint: buildDetailEndpoint(songId),
                    seedInitialState: async () => {
                        Promise.resolve();
                    },
                    expectedStatus: HttpStatusCode.notFound,
                });
            });
        });
    });

    describe(`when the user is an admin`, () => {
        // ADMIN see all
        const assertAdminResult = async (song: EventSourcedSongViewModel) => {
            await assertQueryResult({
                app,
                endpoint: buildDetailEndpoint(song.id),
                seedInitialState: async () => {
                    await songQueryRepository.create(song);
                },
                expectedStatus: HttpStatusCode.ok,
            });
        };

        describe(`when the user is authenticated as a project admin`, () => {
            const testUserWithGroups = new CoscradUserWithGroups(
                buildTestInstance(CoscradUser, {
                    roles: [CoscradUserRole.projectAdmin],
                }),
                []
            );

            beforeAll(async () => {
                await setItUp(testUserWithGroups);
            });

            describe(`when there is a song with the given ID`, () => {
                describe(`when the song is public`, () => {
                    const publicSong = buildTestInstance(EventSourcedSongViewModel, {
                        isPublished: true,
                        accessControlList: new AccessControlList(),
                    });

                    it(`should return the expected result`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(publicSong.id),
                            expectedStatus: HttpStatusCode.ok,
                            seedInitialState: async () => {
                                await songQueryRepository.create(publicSong);
                            },
                            checkResponseBody: async (body) => {
                                expect(body).toMatchSnapshot();
                            },
                        });
                    });
                });

                describe(`when the song is private`, () => {
                    describe(`when the user is in the query ACL`, () => {
                        it(`should return the song`, async () => {
                            await assertAdminResult(
                                buildTestInstance(EventSourcedSongViewModel, {
                                    isPublished: false,
                                    accessControlList: new AccessControlList().allowUser(
                                        testUserWithGroups.id
                                    ),
                                })
                            );
                        });
                    });

                    describe(`when the user is not the query ACL`, () => {
                        it(`should **still** return the song`, async () => {
                            await assertAdminResult(
                                buildTestInstance(EventSourcedSongViewModel, {
                                    isPublished: false,
                                    accessControlList: new AccessControlList(),
                                })
                            );
                        });
                    });
                });
            });

            describe(`when there is no song with the given ID`, () => {
                it(`should return not found`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(buildDummyUuid(9)),
                        expectedStatus: HttpStatusCode.notFound,
                        seedInitialState: async () => {
                            Promise.resolve();
                        },
                    });
                });
            });
        });
    });

    describe(`when the user is an admin`, () => {
        // ADMIN see all
        const assertAdminResult = async (song: EventSourcedSongViewModel) => {
            await assertQueryResult({
                app,
                endpoint: buildDetailEndpoint(song.id),
                seedInitialState: async () => {
                    await songQueryRepository.create(song);
                },
                expectedStatus: HttpStatusCode.ok,
            });
        };

        describe(`when the user is authenticated as a COSCRAD admin`, () => {
            const testUserWithGroups = new CoscradUserWithGroups(
                buildTestInstance(CoscradUser, {
                    roles: [CoscradUserRole.superAdmin],
                }),
                []
            );

            beforeAll(async () => {
                await setItUp(testUserWithGroups);
            });

            describe(`when there is a song with the given ID`, () => {
                describe(`when the song is public`, () => {
                    const publicSong = buildTestInstance(EventSourcedSongViewModel, {
                        isPublished: true,
                        accessControlList: new AccessControlList(),
                    });

                    it(`should return the expected result`, async () => {
                        await assertQueryResult({
                            app,
                            endpoint: buildDetailEndpoint(publicSong.id),
                            expectedStatus: HttpStatusCode.ok,
                            seedInitialState: async () => {
                                await songQueryRepository.create(publicSong);
                            },
                            checkResponseBody: async (body) => {
                                expect(body).toMatchSnapshot();
                            },
                        });
                    });
                });

                describe(`when the song is private`, () => {
                    describe(`when the user is in the query ACL`, () => {
                        it(`should return the song`, async () => {
                            await assertAdminResult(
                                buildTestInstance(EventSourcedSongViewModel, {
                                    isPublished: false,
                                    accessControlList: new AccessControlList().allowUser(
                                        testUserWithGroups.id
                                    ),
                                })
                            );
                        });
                    });

                    describe(`when the user is not the query ACL`, () => {
                        it(`should **still** return the song`, async () => {
                            await assertAdminResult(
                                buildTestInstance(EventSourcedSongViewModel, {
                                    isPublished: false,
                                    accessControlList: new AccessControlList(),
                                })
                            );
                        });
                    });
                });
            });

            describe(`when there is no song with the given ID`, () => {
                it(`should return not found`, async () => {
                    await assertQueryResult({
                        app,
                        endpoint: buildDetailEndpoint(buildDummyUuid(9)),
                        expectedStatus: HttpStatusCode.notFound,
                        seedInitialState: async () => {
                            Promise.resolve();
                        },
                    });
                });
            });
        });
    });
});
