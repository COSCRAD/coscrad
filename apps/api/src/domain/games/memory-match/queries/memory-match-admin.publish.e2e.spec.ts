import { CoscradUserRole, HttpStatusCode } from '@coscrad/api-interfaces';
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
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../models/user-management/user/entities/user/coscrad-user.entity';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

const buildEndpoint = (id: string) => `/games/memory-match/${id}/publish`;

const testMemoryRoundId = buildDummyUuid(321);

const unpublishedMemoryRound = buildTestInstance(MemoryMatchRound, {
    id: testMemoryRoundId,
    isPublished: false,
});

describe(`when using the REST API to publish a memory match round`, () => {
    let app: INestApplication;

    let memoryMatchRepository: IMemoryMatchRepository;

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
            .overrideGuard(AdminJwtGuard)
            .useValue(new MockJwtAdminAuthGuard(user))
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);
    };

    describe(`when the user is a COSCRAD admin`, () => {
        const coscradAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.superAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        beforeEach(async () => {
            await app
                .get(ArangoDatabaseProvider)
                .getDatabaseForCollection('memory_match_rounds')
                .clear();
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close();
        });

        describe(`when there is an existing round`, () => {
            describe(`when the round is not published`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedMemoryRound);
                });

                it(`should publish the round`, async () => {
                    const res = await request(app.getHttpServer()).patch(
                        buildEndpoint(testMemoryRoundId)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const updatedRound = (await memoryMatchRepository.fetchById(
                        testMemoryRoundId
                    )) as MemoryMatchRound;

                    expect(updatedRound.isPublished).toBe(true);
                });
            });

            describe(`when the round is already published`, () => {
                const publishedRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(888),
                    isPublished: true,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedRound);
                });

                it(`should return an error`, async () => {
                    const result = await request(app.getHttpServer()).patch(
                        buildEndpoint(publishedRound.id)
                    );

                    expect(result.status).toBe(HttpStatusCode.badRequest);
                });
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).patch(
                    buildEndpoint('there-is-no-round-with-this-id!')
                );

                // Consider returning a 404 instead
                expect(res.status).toBe(HttpStatusCode.badRequest);
            });
        });
    });

    describe(`when the user is a proect admin`, () => {
        const projectAdminUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.projectAdmin],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(projectAdminUser, []));
        });

        beforeEach(async () => {
            await app
                .get(ArangoDatabaseProvider)
                .getDatabaseForCollection('memory_match_rounds')
                .clear();
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close();
        });

        describe(`when there is an existing round`, () => {
            describe(`when the round is not published`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedMemoryRound);
                });

                it(`should publish the round`, async () => {
                    const res = await request(app.getHttpServer()).patch(
                        buildEndpoint(testMemoryRoundId)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    const updatedRound = (await memoryMatchRepository.fetchById(
                        testMemoryRoundId
                    )) as MemoryMatchRound;

                    expect(updatedRound.isPublished).toBe(true);
                });
            });

            describe(`when the round is already published`, () => {
                const publishedRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(888),
                    isPublished: true,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedRound);
                });

                it(`should return an error`, async () => {
                    const result = await request(app.getHttpServer()).patch(
                        buildEndpoint(publishedRound.id)
                    );

                    expect(result.status).toBe(HttpStatusCode.badRequest);
                });
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).patch(
                    buildEndpoint('there-is-no-round-with-this-id!')
                );

                // Consider returning a 404 instead
                expect(res.status).toBe(HttpStatusCode.badRequest);
            });
        });
    });

    describe(`when the user is an ordinary user (viewer)`, () => {
        const viewerUser = buildTestInstance(CoscradUser, {
            roles: [CoscradUserRole.viewer],
        });

        beforeAll(async () => {
            await setItUp(new CoscradUserWithGroups(viewerUser, []));
        });

        beforeEach(async () => {
            await app
                .get(ArangoDatabaseProvider)
                .getDatabaseForCollection('memory_match_rounds')
                .clear();
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close();
        });

        describe(`when there is an existing round`, () => {
            describe(`when the round is not published`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedMemoryRound);
                });

                it(`should return unauthorized`, async () => {
                    const res = await request(app.getHttpServer()).patch(
                        buildEndpoint(testMemoryRoundId)
                    );

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });

            describe(`when the round is already published`, () => {
                const publishedRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(888),
                    isPublished: true,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedRound);
                });

                it(`should return an error`, async () => {
                    const result = await request(app.getHttpServer()).patch(
                        buildEndpoint(publishedRound.id)
                    );

                    expect(result.status).toBe(HttpStatusCode.forbidden);
                });
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should return unauthorized`, async () => {
                const res = await request(app.getHttpServer()).patch(
                    buildEndpoint('there-is-no-round-with-this-id!')
                );

                // Consider returning a 404 instead
                expect(res.status).toBe(HttpStatusCode.forbidden);
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

            app.get(ArangoDatabaseProvider).close();
        });

        describe(`when there is an existing round`, () => {
            describe(`when the round is not published`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(unpublishedMemoryRound);
                });

                it(`should return unauthorized`, async () => {
                    const res = await request(app.getHttpServer()).patch(
                        buildEndpoint(testMemoryRoundId)
                    );

                    expect(res.status).toBe(HttpStatusCode.forbidden);
                });
            });

            describe(`when the round is already published`, () => {
                const publishedRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(888),
                    isPublished: true,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(publishedRound);
                });

                it(`should return an error`, async () => {
                    const result = await request(app.getHttpServer()).patch(
                        buildEndpoint(publishedRound.id)
                    );

                    expect(result.status).toBe(HttpStatusCode.forbidden);
                });
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should return unauthorized`, async () => {
                const res = await request(app.getHttpServer()).patch(
                    buildEndpoint('there-is-no-round-with-this-id!')
                );

                // Consider returning a 404 instead
                expect(res.status).toBe(HttpStatusCode.forbidden);
            });
        });
    });
});
