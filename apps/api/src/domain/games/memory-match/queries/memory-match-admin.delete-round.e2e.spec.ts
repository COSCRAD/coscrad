import { CoscradUserRole, HttpStatusCode } from '@coscrad/api-interfaces';
import { UnionFactory } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryService } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import { AuthorizationModule } from '../../../../authorization/authorization.module';
import { MockJwtAdminAuthGuard } from '../../../../authorization/mock-jwt-admin-auth-guard';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { DTO } from '../../../../types/DTO';
import { DynamicDataTypeFinderService } from '../../../../validation';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../models/user-management/user/entities/user/coscrad-user.entity';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

const buildEndpoint = (id: string) => `/games/memory-match/${id}`;

const testMemoryRoundId = buildDummyUuid(876);

describe(`when using the REST API to delete a memory match round`, () => {
    let app: INestApplication;

    let memoryMatchRepository: IMemoryMatchRepository;

    let rawDatabaseForMemoryMatch: ArangoDatabaseForCollection<DTO<MemoryMatchRound>>;

    const mockDiscoveryService = {
        getProviders: (_: any) => {
            return [];
        },
    };

    const mockUnionFactory = {
        build: (_in: any) => {
            throw new Error('not implemented');
        },
    };

    const setItUp = async (user?: CoscradUserWithGroups) => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                AuthorizationModule,
                PersistenceModule.forRootAsync(),
                MemoryMatchModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    NODE_PORT: 3131,
                })
            )
            .overrideGuard(AdminJwtGuard)
            .useValue(new MockJwtAdminAuthGuard(user))
            .overrideProvider(DynamicDataTypeFinderService)
            .useValue({
                bootstrapDynamicTypes: async () => {
                    Promise.resolve();
                },
            })
            .overrideProvider(UnionFactory)
            .useValue(mockUnionFactory)
            .overrideProvider(DiscoveryService)
            .useValue(mockDiscoveryService)

            .compile();

        app = testModule.createNestApplication();

        await app.init();

        memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);

        rawDatabaseForMemoryMatch = new ArangoDatabaseForCollection(
            new ArangoDatabase(app.get(ArangoConnectionProvider).getConnection()),
            'memory_match_rounds'
        );
    };

    beforeEach(async () => {
        await app
            .get(ArangoDatabaseProvider)
            .getDatabaseForCollection('memory_match_rounds')
            .clear();
    });

    describe(`when the user is a COSCRAD admin`, () => {
        const coscradAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.superAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close;
        });

        describe(`when the target round is available for deletion`, () => {
            // published case
            describe(`when the round is published`, () => {
                const publishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: true,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedRound);
                });

                it(`should delete the round`, async () => {
                    const server = app.getHttpServer();

                    const endpoint = buildEndpoint(testMemoryRoundId);

                    const res = await request(server).delete(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const searchResponse = await request(server).get(
                        buildEndpoint(testMemoryRoundId)
                    );

                    expect(searchResponse.status).toBe(HttpStatusCode.notFound);
                });
            });

            // not published case
            describe(`when the round is not yet published`, () => {
                const unpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedRound);
                });

                it(`should delete the round`, async () => {
                    const server = app.getHttpServer();

                    const endpoint = buildEndpoint(testMemoryRoundId);

                    const res = await request(server).delete(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const searchResponse = await request(server).get(
                        buildEndpoint(testMemoryRoundId)
                    );

                    expect(searchResponse.status).toBe(HttpStatusCode.notFound);
                });
            });
        });

        describe(`when the round is not available to be deleted`, () => {
            describe(`when the round does not exist`, () => {
                it(`should return the expected error`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).delete(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.notFound);
                });
            });

            describe(`when the round has already been deleted`, () => {
                const deletedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: true,
                });

                const deletedRoundDto = {
                    ...deletedRound.toDTO(),
                    __isDeleted: true,
                };

                beforeEach(async () => {
                    await rawDatabaseForMemoryMatch.create(
                        mapEntityDTOToDatabaseDocument(deletedRoundDto)
                    );
                });

                it(`should should not found`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).delete(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.notFound);
                });
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        const coscradAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.projectAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close;
        });

        describe(`when the target round is available for deletion`, () => {
            describe(`when the round is published`, () => {
                const publishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: true,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedRound);
                });

                it(`should delete the round`, async () => {
                    const server = app.getHttpServer();

                    const endpoint = buildEndpoint(testMemoryRoundId);

                    const res = await request(server).delete(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const searchResponse = await request(server).get(
                        buildEndpoint(testMemoryRoundId)
                    );

                    expect(searchResponse.status).toBe(HttpStatusCode.notFound);
                });
            });

            describe(`when the round is not yet published`, () => {
                const unpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedRound);
                });

                it(`should delete the round`, async () => {
                    const server = app.getHttpServer();

                    const endpoint = buildEndpoint(testMemoryRoundId);

                    const res = await request(server).delete(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const searchResponse = await request(server).get(
                        buildEndpoint(testMemoryRoundId)
                    );

                    expect(searchResponse.status).toBe(HttpStatusCode.notFound);
                });
            });
        });

        describe(`when the round is not available to be deleted`, () => {
            describe(`when the round does not exist`, () => {
                it(`should return the expected error`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).delete(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.notFound);
                });
            });

            describe(`when the round has already been deleted`, () => {
                const deletedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: true,
                });

                const deletedRoundDto = {
                    ...deletedRound.toDTO(),
                    __isDeleted: true,
                };

                beforeEach(async () => {
                    await rawDatabaseForMemoryMatch.create(
                        mapEntityDTOToDatabaseDocument(deletedRoundDto)
                    );
                });

                it(`should should not found`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).delete(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.notFound);
                });
            });
        });
    });

    describe(`when the user is a Ordinary User (viewer)`, () => {
        const coscradAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.viewer],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close;
        });

        describe(`when the target round is available for deletion`, () => {
            describe(`when the round is published`, () => {
                const publishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: true,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedRound);
                });

                it(`should delete the round`, async () => {
                    const server = app.getHttpServer();

                    const endpoint = buildEndpoint(testMemoryRoundId);

                    const res = await request(server).delete(endpoint);

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });

            describe(`when the round is not yet published`, () => {
                const unpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedRound);
                });

                it(`should delete the round`, async () => {
                    const server = app.getHttpServer();

                    const endpoint = buildEndpoint(testMemoryRoundId);

                    const res = await request(server).delete(endpoint);

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });
        });

        describe(`when the round is not available to be deleted`, () => {
            describe(`when the round does not exist`, () => {
                it(`should return the expected error`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).delete(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });

            describe(`when the round has already been deleted`, () => {
                const deletedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: true,
                });

                const deletedRoundDto = {
                    ...deletedRound.toDTO(),
                    __isDeleted: true,
                };

                beforeEach(async () => {
                    await rawDatabaseForMemoryMatch.create(
                        mapEntityDTOToDatabaseDocument(deletedRoundDto)
                    );
                });

                it(`should should not found`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).delete(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });
        });
    });

    describe(`when the user is not authenticated`, () => {
        beforeAll(async () => {
            await setItUp(undefined);
        });

        beforeEach(async () => {
            await app
                .get(ArangoDatabaseProvider)
                .getDatabaseForCollection('memory_match_rounds')
                .clear();
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close;
        });

        describe(`when the target round is available for deletion`, () => {
            describe(`when the round is published`, () => {
                const publishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: true,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedRound);
                });

                it(`should delete the round`, async () => {
                    const server = app.getHttpServer();

                    const endpoint = buildEndpoint(testMemoryRoundId);

                    const res = await request(server).delete(endpoint);

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });

            describe(`when the round is not yet published`, () => {
                const unpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedRound);
                });

                it(`should delete the round`, async () => {
                    const server = app.getHttpServer();

                    const endpoint = buildEndpoint(testMemoryRoundId);

                    const res = await request(server).delete(endpoint);

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });
        });

        describe(`when the round is not available to be deleted`, () => {
            describe(`when the round does not exist`, () => {
                it(`should return the expected error`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).delete(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });

            describe(`when the round has already been deleted`, () => {
                const deletedRound = buildTestInstance(MemoryMatchRound, {
                    id: testMemoryRoundId,
                    isPublished: true,
                });

                const deletedRoundDto = {
                    ...deletedRound.toDTO(),
                    __isDeleted: true,
                };

                beforeEach(async () => {
                    await rawDatabaseForMemoryMatch.create(
                        mapEntityDTOToDatabaseDocument(deletedRoundDto)
                    );
                });

                it(`should should not found`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).delete(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });
        });
    });
});
