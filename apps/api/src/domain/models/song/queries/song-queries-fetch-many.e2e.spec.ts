import {
    CoscradUserRole,
    HttpStatusCode,
    IIndexQueryResult,
    ISongViewModel,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
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

const endpoint = `/resources/songs`;

const testUserId = buildDummyUuid(2);

const publicSong = buildTestInstance(EventSourcedSongViewModel, {
    id: buildDummyUuid(20),
    name: buildMultilingualTextWithSingleItem('public song'),
    isPublished: true,
    accessControlList: new AccessControlList(),
});

const privateSong = buildTestInstance(EventSourcedSongViewModel, {
    id: buildDummyUuid(21),
    name: buildMultilingualTextWithSingleItem('private song'),
    isPublished: false,
    accessControlList: new AccessControlList(),
});

const privateSongUserCanAccessViaACL = buildTestInstance(EventSourcedSongViewModel, {
    id: buildDummyUuid(22),
    name: buildMultilingualTextWithSingleItem(`private song user can access`),
    isPublished: false,
    accessControlList: new AccessControlList().allowUser(testUserId),
});

const allSongs = [publicSong, privateSong, privateSongUserCanAccessViaACL];

describe(`song queries: fetch many`, () => {
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

    const seedInitialState = async () => {
        await songQueryRepository.createMany(allSongs);
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

    describe(`when the user is unauthenticated (public user)`, () => {
        beforeAll(async () => {
            // no mock user here
            await setItUp();
        });

        it(`should return public audio items only`, async () => {
            await assertQueryResult({
                app,
                endpoint,
                seedInitialState,
                expectedStatus: HttpStatusCode.ok,
                checkResponseBody: async ({ entities }: IIndexQueryResult<ISongViewModel>) => {
                    expect(entities).toHaveLength(1);

                    const { name } = entities[0];

                    expect(new MultilingualText(name).toDTO()).toEqual(publicSong.name.toDTO());
                },
            });
        });
    });

    describe(`when the user is authenticated as an ordinary viewer`, () => {
        const ordinaryUser = new CoscradUserWithGroups(
            buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.viewer],
                id: testUserId,
            }),
            []
        );

        beforeAll(async () => {
            await setItUp(ordinaryUser);
        });

        it(`should return the public songs and the songs for which the user is in the ACL`, async () => {
            await assertQueryResult({
                app,
                endpoint,
                seedInitialState,
                expectedStatus: HttpStatusCode.ok,
                checkResponseBody: async ({ entities }: IIndexQueryResult<ISongViewModel>) => {
                    expect(entities).toHaveLength(2);

                    expect(entities.find(({ id }) => id === privateSong.id)).toBeFalsy();
                },
            });
        });
    });

    describe(`when the user is authenticated as a project admin`, () => {
        beforeAll(async () => {
            await setItUp(
                new CoscradUserWithGroups(
                    buildTestInstance(CoscradUser, {
                        roles: [CoscradUserRole.projectAdmin],
                        id: testUserId,
                    }),
                    []
                )
            );
        });

        it(`should return all resources`, async () => {
            await assertQueryResult({
                app,
                endpoint,
                seedInitialState,
                expectedStatus: HttpStatusCode.ok,
                checkResponseBody: async ({ entities }: IIndexQueryResult<ISongViewModel>) => {
                    expect(entities).toHaveLength(3);
                },
            });
        });
    });

    describe(`when the user is authenticated as a coscrad admin`, () => {
        beforeAll(async () => {
            await setItUp(
                new CoscradUserWithGroups(
                    buildTestInstance(CoscradUser, {
                        roles: [CoscradUserRole.superAdmin],
                        id: testUserId,
                    }),
                    []
                )
            );
        });

        it(`should return all resources`, async () => {
            await assertQueryResult({
                app,
                endpoint,
                seedInitialState,
                expectedStatus: HttpStatusCode.ok,
                checkResponseBody: async ({ entities }: IIndexQueryResult<ISongViewModel>) => {
                    expect(entities).toHaveLength(3);
                },
            });
        });
    });
});
