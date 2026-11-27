import { CoscradUserRole, HttpStatusCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import httpStatusCodes from '../../../../app/constants/httpStatusCodes';
import { GeospatialMapModule } from '../../../../app/domain-modules/geospatial-map.module';
import { MockJwtAuthGuard } from '../../../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { AggregateId } from '../../../types/AggregateId';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import {
    GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN,
    IGeospatialMapQueryRepository,
} from '../repositories/geospatial-map-query-repository.interface';
import { GeospatialMapViewModel } from './geospatial-map.view-model';

const buildDetailEndpoint = (id: AggregateId) => `/resources/maps/${id}`;

const userId = buildDummyUuid(1234);

const unpublishedMapWithUserInACL = buildTestInstance(GeospatialMapViewModel, {
    id: buildDummyUuid(4),
    isPublished: false,
    accessControlList: new AccessControlList({
        allowedUserIds: [userId],
    }),
});

const unpublishedMap = buildTestInstance(GeospatialMapViewModel, {
    id: buildDummyUuid(1),
    isPublished: false,
});

const publishedMap = buildTestInstance(GeospatialMapViewModel, {
    id: buildDummyUuid(2),
    isPublished: true,
});

describe(`when querying for a geospatial map: fetch by id`, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let geospatialMapQueryRepository: IGeospatialMapQueryRepository;

    const setItUp = async (userWithGroups?: CoscradUserWithGroups) => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),

                PersistenceModule.forRootAsync(),
                GeospatialMapModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(new MockJwtAuthGuard(userWithGroups, true))
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        geospatialMapQueryRepository = app.get(GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN);

        await app.init();
    };

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            await setItUp();
        });

        describe(`when the geospatial map is public`, () => {
            describe(`when there is a geospatial map with the given ID`, () => {
                it.todo('should find it');
            });
        });
    });

    describe(`when the user is an ordinary user (viewer)`, () => {
        beforeAll(async () => {
            const ordinaryUser = buildTestInstance(CoscradUser, {
                id: userId,
                roles: [CoscradUserRole.viewer],
            });

            await setItUp(new CoscradUserWithGroups(ordinaryUser, []));
        });

        describe(`when the geospatial map is published`, () => {
            beforeEach(async () => {
                await geospatialMapQueryRepository.create(publishedMap);
            });

            it(`should fine it`, async () => {
                const endpoint = buildDetailEndpoint(publishedMap.id);

                const res = await request(app.getHttpServer()).get(endpoint);

                expect(res.status).toBe(httpStatusCodes.ok);
            });
        });

        describe(`when the geospatial map is not published`, () => {
            describe(`when the user is in the ACL`, () => {
                beforeEach(async () => {
                    await geospatialMapQueryRepository.create(unpublishedMapWithUserInACL);
                });

                it(`should find it`, async () => {
                    const endpoint = buildDetailEndpoint(unpublishedMapWithUserInACL.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);
                });
            });

            describe(`when the user is not in the ACL`, () => {
                beforeEach(async () => {
                    await geospatialMapQueryRepository.create(unpublishedMap);
                });

                it(`should return not found`, async () => {
                    const endpoint = buildDetailEndpoint(unpublishedMap.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.notFound);
                });
            });
        });
    });

    describe(`when the user is a system (COSCRAD) admin`, () => {
        beforeAll(async () => {
            const coscradAdminUser = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.superAdmin],
            });

            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        describe(`when the geospatial map has not been published`, () => {
            describe(`when there is a geospatial map with the given ID`, () => {
                beforeEach(async () => {
                    await geospatialMapQueryRepository.create(unpublishedMap);
                });

                it(`should find it`, async () => {
                    const endpoint = buildDetailEndpoint(unpublishedMap.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body).toMatchSnapshot();
                });
            });

            describe(`when the geospatial is published`, () => {
                beforeEach(async () => {
                    await geospatialMapQueryRepository.create(publishedMap);
                });

                it(`should return the expected result`, async () => {
                    const endpoint = buildDetailEndpoint(publishedMap.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(httpStatusCodes.ok);

                    expect(res.body.actions).not.toEqual([]);
                });
            });

            describe(`when geospatial map does not exist`, () => {
                it(`should return not found`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(buildDummyUuid(123))
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        beforeAll(async () => {
            const coscradAdminUser = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.projectAdmin],
            });

            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        describe(`when the geospatial map is published`, () => {
            beforeEach(async () => {
                await geospatialMapQueryRepository.create(publishedMap);
            });

            it(`should return the expected result`, async () => {
                const endpoint = buildDetailEndpoint(publishedMap.id);

                const res = await request(app.getHttpServer()).get(endpoint);

                expect(res.status).toBe(httpStatusCodes.ok);

                expect(res.body.actions).not.toEqual([]);
            });
        });

        describe(`when the geospatial map has not been published`, () => {
            beforeEach(async () => {
                await geospatialMapQueryRepository.create(unpublishedMap);
            });

            it(`should find it`, async () => {
                const endpoint = buildDetailEndpoint(unpublishedMap.id);

                const res = await request(app.getHttpServer()).get(endpoint);

                expect(res.status).toBe(HttpStatusCode.ok);
            });
        });

        describe(`when the geospatial map does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(321))
                );

                expect(res.status).toBe(httpStatusCodes.notFound);
            });
        });
    });
});
