import { LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../types/AggregateId';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../__tests__/utilities/dummySystemUserId';
import { AccessControlList } from '../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../user-management/user/entities/user/coscrad-user.entity';
import { PlaylistViewModel } from './playlist.view-model';
import { IPlaylistQueryRepository, PLAYLIST_QUERY_REPOSITORY_TOKEN } from './queries';

const indexEndpoint = `/resources/playlists`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

const dummyUser = buildTestInstance(CoscradUser, {
    id: dummySystemUserId,
    roles: [],
});

// TODO Support user groups
const _dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, []);

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
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                }
                // no authenticated user
            ));

            playlistQueryRepository = app.get(PLAYLIST_QUERY_REPOSITORY_TOKEN);
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
            beforeEach(async () => {
                await playlistQueryRepository.create(publishedPlaylistWithNoSpecialAccess);
            });

            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(159))
                );

                expect(res.status).toBe(httpStatusCodes.notFound);
            });
        });
    });

    describe(`when the user is authenticated as a regular viewer (non-admin)`, () => {
        it.todo(`should have a test`);
    });

    describe(`when the user is a COSCRAD admin`, () => {
        it.todo(`should have a test`);
    });

    describe(`when the user is a project admin`, () => {
        it.todo(`should have a test`);
    });
});
