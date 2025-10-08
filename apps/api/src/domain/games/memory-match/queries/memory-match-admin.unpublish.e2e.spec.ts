import { CoscradUserRole, HttpStatusCode } from '@coscrad/api-interfaces';
import { UnionFactory } from '@coscrad/data-types';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import { MockJwtAdminAuthGuard } from '../../../../authorization/mock-jwt-admin-auth-guard';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
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

const buildEndpoint = (id: string) => `/games/memory-match/${id}/unpublish`;

const testMemoryRoundId = buildDummyUuid(432);

const publishedMemoryMatchRound = buildTestInstance(MemoryMatchRound, {
    id: testMemoryRoundId,
    isPublished: true,
});

describe(`when using the REST API to unpublish a memory match round`, () => {
    let app: INestApplication;

    let memoryMatchRepository: IMemoryMatchRepository;

    const mockDiscoveryService = {
        providers: (_: any) => {
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

        describe(`when there is an existing round`, () => {
            describe(`when the round is published`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedMemoryMatchRound);
                });

                it(`should unpublish the round`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).patch(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const updatedRound = (await memoryMatchRepository.fetchById(
                        testMemoryRoundId
                    )) as MemoryMatchRound;

                    expect(updatedRound.isPublished).toBe(false);
                });
            });

            describe(`when the round is not yet published`, () => {
                const unpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(999),
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedRound);
                });

                it(`should return an error`, async () => {
                    const result = await request(app.getHttpServer()).patch(
                        buildEndpoint(unpublishedRound.id)
                    );

                    expect(result.status).toBe(HttpStatusCode.badRequest);
                });
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).patch(
                    buildEndpoint(publishedMemoryMatchRound.id)
                );

                expect(res.status).toBe(HttpStatusCode.badRequest);
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        const projectAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.projectAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(projectAdminUser, []));
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close;
        });

        describe(`when there is an existing round`, () => {
            describe(`when the round is published`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedMemoryMatchRound);
                });

                it(`should unpublish the round`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).patch(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const updatedRound = (await memoryMatchRepository.fetchById(
                        testMemoryRoundId
                    )) as MemoryMatchRound;

                    expect(updatedRound.isPublished).toBe(false);
                });
            });

            describe(`when the round is not yet published`, () => {
                const unpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(999),
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedRound);
                });

                it(`should return an error`, async () => {
                    const result = await request(app.getHttpServer()).patch(
                        buildEndpoint(unpublishedRound.id)
                    );

                    expect(result.status).toBe(HttpStatusCode.badRequest);
                });
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).patch(
                    buildEndpoint(publishedMemoryMatchRound.id)
                );

                expect(res.status).toBe(HttpStatusCode.badRequest);
            });
        });
    });

    describe(`when the user is an ordinary user (viewer)`, () => {
        const ordinaryUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.viewer],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(ordinaryUser, []));
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close;
        });

        describe(`when there is an existing round`, () => {
            describe(`when the round is published`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedMemoryMatchRound);
                });

                it(`should return unauthorized`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).patch(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });

            describe(`when the round is not yet published`, () => {
                const unpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(999),
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedRound);
                });

                it(`should return an error`, async () => {
                    const result = await request(app.getHttpServer()).patch(
                        buildEndpoint(unpublishedRound.id)
                    );

                    expect(result.status).toBe(HttpStatusCode.forbidden);
                });
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).patch(
                    buildEndpoint(publishedMemoryMatchRound.id)
                );

                expect(res.status).toBe(HttpStatusCode.forbidden);
            });
        });
    });

    describe(`when the user is not authenticated (public)`, () => {
        beforeAll(async () => {
            await setItUp(undefined);
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close;
        });

        describe(`when there is an existing round`, () => {
            describe(`when the round is published`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedMemoryMatchRound);
                });

                it(`should return unauthorized`, async () => {
                    const server = app.getHttpServer();

                    const res = await request(server).patch(buildEndpoint(testMemoryRoundId));

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });

            describe(`when the round is not yet published`, () => {
                const unpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(999),
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedRound);
                });

                it(`should return an error`, async () => {
                    const result = await request(app.getHttpServer()).patch(
                        buildEndpoint(unpublishedRound.id)
                    );

                    expect(result.status).toBe(HttpStatusCode.forbidden);
                });
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).patch(
                    buildEndpoint(publishedMemoryMatchRound.id)
                );

                expect(res.status).toBe(HttpStatusCode.forbidden);
            });
        });
    });
});
