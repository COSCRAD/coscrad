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

const buildEndpoint = (id: string, sequenceNumber: number) =>
    `/games/memory-match/${id}/cards/${sequenceNumber}`;

const testMemoryRoundId = buildDummyUuid(420);

const targetSquenceNumber = 123;

const initialSize = 5;

const testRound = buildTestInstance(MemoryMatchRound, {
    id: testMemoryRoundId,
    cards: Array(initialSize)
        .fill(null)
        .map((_, index) =>
            buildTestInstance(MemoryMatchCard, {
                sequenceNumber: index === 2 ? targetSquenceNumber : index + 1,
            })
        ),
});

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

        describe(`when the request is valid`, () => {
            beforeEach(async () => {
                await memoryMatchRepository.create(testRound);
            });

            it(`should remove the card`, async () => {
                const endpoint = buildEndpoint(testMemoryRoundId, targetSquenceNumber);

                const res = await request(app.getHttpServer()).delete(endpoint);

                expect(res.status).toBe(HttpStatusCode.ok);

                const updatedRound = (await memoryMatchRepository.fetchById(
                    testMemoryRoundId
                )) as MemoryMatchRound;

                expect(updatedRound.count()).toBe(initialSize - 1);

                expect(updatedRound.has(targetSquenceNumber)).toBe(false);
            });
        });

        describe(`when the round is not yet published`, () => {
            beforeEach(async () => {
                await memoryMatchRepository.create(testRound);
            });

            it(`should remove the card`, async () => {
                const endpoint = buildEndpoint(testMemoryRoundId, targetSquenceNumber);

                const res = await request(app.getHttpServer()).delete(endpoint);

                expect(res.status).toBe(HttpStatusCode.ok);
            });
        });
    });
});
