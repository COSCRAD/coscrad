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
import { InternalError } from '../../../../lib/errors/InternalError';
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
import { MemoryMatchCard } from '../models/memory-match-card.entity';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

const NUMBER_OF_PAIRS_IN_A_ROUND = 12;

const buildEndpoint = (id: string, sequenceNumber: number) =>
    `/games/memory-match/${id}/cards/${sequenceNumber}`;

const testMemoryRoundId = buildDummyUuid(420);

const targetSquenceNumber = 123;

describe(`when using the REST API to remove a card from a memory match round`, () => {
    let app: INestApplication;

    let memoryMatchRepository: IMemoryMatchRepository;

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

        describe(`when the round is already published`, () => {
            const publishedRound = buildTestInstance(MemoryMatchRound, {
                isPublished: true,
                id: testMemoryRoundId,
                cardBackImageId: buildDummyUuid(50),
                cards: Array(NUMBER_OF_PAIRS_IN_A_ROUND)
                    .fill(null)
                    .map((_, index) =>
                        buildTestInstance(MemoryMatchCard, {
                            sequenceNumber: index === 0 ? targetSquenceNumber : index + 1,
                            audioId: buildDummyUuid(100 + index),
                            imageId: buildDummyUuid(200 + index),
                        })
                    ),
            });

            const validationResult = publishedRound.validateInvariants();

            if (validationResult.length > 0) {
                throw new InternalError(`Test setup failed`, validationResult);
            }

            beforeEach(async () => {
                await memoryMatchRepository.create(publishedRound);
            });

            it(`should return the expected error`, async () => {
                const res = await request(app.getHttpServer()).delete(
                    buildEndpoint(publishedRound.id, targetSquenceNumber)
                );

                expect(res.statusCode).toBe(HttpStatusCode.badRequest);

                const { message } = res.body;

                expect(message).toContain(publishedRound.id);

                expect(message).toContain(targetSquenceNumber.toString());

                expect(message).toContain(`already published`);
            });
        });

        describe(`when there is no card with the sequence number`, () => {
            const missingSequenceNumber = 404;

            const bogusRound = buildTestInstance(MemoryMatchRound, {
                id: buildDummyUuid(2),
                isPublished: false,
                cards: [1, 2, 4].map((sequenceNumber) =>
                    buildTestInstance(MemoryMatchCard, {
                        sequenceNumber,
                    })
                ),
            });

            beforeEach(async () => {
                await memoryMatchRepository.create(bogusRound);
            });

            it(`should return the expected error`, async () => {
                const res = await request(app.getHttpServer()).delete(
                    buildEndpoint(bogusRound.id, missingSequenceNumber)
                );

                expect(res.statusCode).toBe(HttpStatusCode.badRequest);

                const { message } = res.body;

                expect(message).toContain(missingSequenceNumber.toString());
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                const server = app.getHttpServer();

                const res = await request(server).delete(
                    buildEndpoint(testMemoryRoundId, targetSquenceNumber)
                );

                expect(res.status).toBe(HttpStatusCode.badRequest);

                const { message } = res.body;

                expect(message).toContain(testMemoryRoundId);
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

        describe(`when the round is already published`, () => {
            const publishedRound = buildTestInstance(MemoryMatchRound, {
                isPublished: true,
                id: testMemoryRoundId,
                cardBackImageId: buildDummyUuid(50),
                cards: Array(NUMBER_OF_PAIRS_IN_A_ROUND)
                    .fill(null)
                    .map((_, index) =>
                        buildTestInstance(MemoryMatchCard, {
                            sequenceNumber: index === 0 ? targetSquenceNumber : index + 1,
                            audioId: buildDummyUuid(100 + index),
                            imageId: buildDummyUuid(200 + index),
                        })
                    ),
            });

            const validationResult = publishedRound.validateInvariants();

            if (validationResult.length > 0) {
                throw new InternalError(`Test setup failed`, validationResult);
            }

            beforeEach(async () => {
                await memoryMatchRepository.create(publishedRound);
            });

            it(`should return the expected error`, async () => {
                const res = await request(app.getHttpServer()).delete(
                    buildEndpoint(publishedRound.id, targetSquenceNumber)
                );

                expect(res.statusCode).toBe(HttpStatusCode.badRequest);

                const { message } = res.body;

                expect(message).toContain(publishedRound.id);

                expect(message).toContain(targetSquenceNumber.toString());

                expect(message).toContain(`already published`);
            });
        });

        describe(`when there is no card with the sequence number`, () => {
            const missingSequenceNumber = 404;

            const bogusRound = buildTestInstance(MemoryMatchRound, {
                id: buildDummyUuid(2),
                isPublished: false,
                cards: [1, 2, 4].map((sequenceNumber) =>
                    buildTestInstance(MemoryMatchCard, {
                        sequenceNumber,
                    })
                ),
            });

            beforeEach(async () => {
                await memoryMatchRepository.create(bogusRound);
            });

            it(`should return the expected error`, async () => {
                const res = await request(app.getHttpServer()).delete(
                    buildEndpoint(bogusRound.id, missingSequenceNumber)
                );

                expect(res.statusCode).toBe(HttpStatusCode.badRequest);

                const { message } = res.body;

                expect(message).toContain(missingSequenceNumber.toString());
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                const server = app.getHttpServer();

                const res = await request(server).delete(
                    buildEndpoint(testMemoryRoundId, targetSquenceNumber)
                );

                expect(res.status).toBe(HttpStatusCode.badRequest);

                const { message } = res.body;

                expect(message).toContain(testMemoryRoundId);
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

        describe(`when the round is already published`, () => {
            const publishedRound = buildTestInstance(MemoryMatchRound, {
                isPublished: true,
                id: testMemoryRoundId,
                cardBackImageId: buildDummyUuid(50),
                cards: Array(NUMBER_OF_PAIRS_IN_A_ROUND)
                    .fill(null)
                    .map((_, index) =>
                        buildTestInstance(MemoryMatchCard, {
                            sequenceNumber: index === 0 ? targetSquenceNumber : index + 1,
                            audioId: buildDummyUuid(100 + index),
                            imageId: buildDummyUuid(200 + index),
                        })
                    ),
            });

            const validationResult = publishedRound.validateInvariants();

            if (validationResult.length > 0) {
                throw new InternalError(`Test setup failed`, validationResult);
            }

            beforeEach(async () => {
                await memoryMatchRepository.create(publishedRound);
            });

            it(`should return the expected error`, async () => {
                const res = await request(app.getHttpServer()).delete(
                    buildEndpoint(publishedRound.id, targetSquenceNumber)
                );

                expect(res.statusCode).toBe(HttpStatusCode.forbidden);
            });
        });

        describe(`when there is no card with the sequence number`, () => {
            const missingSequenceNumber = 404;

            const bogusRound = buildTestInstance(MemoryMatchRound, {
                id: buildDummyUuid(2),
                isPublished: false,
                cards: [1, 2, 4].map((sequenceNumber) =>
                    buildTestInstance(MemoryMatchCard, {
                        sequenceNumber,
                    })
                ),
            });

            it(`should return the expected error`, async () => {
                const res = await request(app.getHttpServer()).delete(
                    buildEndpoint(bogusRound.id, missingSequenceNumber)
                );

                expect(res.statusCode).toBe(HttpStatusCode.forbidden);
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                const server = app.getHttpServer();

                const res = await request(server).delete(
                    buildEndpoint(testMemoryRoundId, targetSquenceNumber)
                );

                expect(res.status).toBe(HttpStatusCode.forbidden);
            });
        });
    });

    describe(`when the user is not authenticated`, () => {
        beforeAll(async () => {
            await setItUp(undefined);
        });

        afterAll(async () => {
            await app.close();

            app.get(ArangoDatabaseProvider).close;
        });

        describe(`when the round is already published`, () => {
            const publishedRound = buildTestInstance(MemoryMatchRound, {
                isPublished: true,
                id: testMemoryRoundId,
                cardBackImageId: buildDummyUuid(50),
                cards: Array(NUMBER_OF_PAIRS_IN_A_ROUND)
                    .fill(null)
                    .map((_, index) =>
                        buildTestInstance(MemoryMatchCard, {
                            sequenceNumber: index === 0 ? targetSquenceNumber : index + 1,
                            audioId: buildDummyUuid(100 + index),
                            imageId: buildDummyUuid(200 + index),
                        })
                    ),
            });

            const validationResult = publishedRound.validateInvariants();

            if (validationResult.length > 0) {
                throw new InternalError(`Test setup failed`, validationResult);
            }

            beforeEach(async () => {
                await memoryMatchRepository.create(publishedRound);
            });

            it(`should return the expected error`, async () => {
                const res = await request(app.getHttpServer()).delete(
                    buildEndpoint(publishedRound.id, targetSquenceNumber)
                );

                expect(res.statusCode).toBe(HttpStatusCode.forbidden);
            });
        });

        describe(`when there is no card with the sequence number`, () => {
            const missingSequenceNumber = 404;

            const bogusRound = buildTestInstance(MemoryMatchRound, {
                id: buildDummyUuid(2),
                isPublished: false,
                cards: [1, 2, 4].map((sequenceNumber) =>
                    buildTestInstance(MemoryMatchCard, {
                        sequenceNumber,
                    })
                ),
            });

            it(`should return the expected error`, async () => {
                const res = await request(app.getHttpServer()).delete(
                    buildEndpoint(bogusRound.id, missingSequenceNumber)
                );

                expect(res.statusCode).toBe(HttpStatusCode.forbidden);
            });
        });

        describe(`when the round does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                const server = app.getHttpServer();

                const res = await request(server).delete(
                    buildEndpoint(testMemoryRoundId, targetSquenceNumber)
                );

                expect(res.status).toBe(HttpStatusCode.forbidden);
            });
        });
    });
});
