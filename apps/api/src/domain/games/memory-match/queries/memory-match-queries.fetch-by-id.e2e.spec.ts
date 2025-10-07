import { CoscradUserRole, HttpStatusCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { AdminJwtGuard } from '../../../../app/controllers/command/command.controller';
import { AuthorizationModule } from '../../../../authorization/authorization.module';
import { MockJwtAdminAuthGuard } from '../../../../authorization/mock-jwt-admin-auth-guard';
import { MockJwtAuthGuard } from '../../../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../../../authorization/optional-jwt-auth-guard';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../validation';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../models/user-management/user/entities/user/coscrad-user.entity';
import { AggregateId } from '../../../types/AggregateId';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchCard } from '../models/memory-match-card.entity';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

const buildDetailEndpoint = (id: AggregateId) => `/games/memory-match/${id}`;

const MEMORY_MATCH_ROUNDS = 'memory_match_rounds';

const roundId = buildDummyUuid(34);

const MAX_NUMBER_OF_CARDS = 12;

const testCards = Array(MAX_NUMBER_OF_CARDS)
    .fill(null)
    .map((_, index) => {
        const sequenceNumber = index + 1;

        const buildResult = buildTestInstance(MemoryMatchCard, {
            sequenceNumber,
            text: buildMultilingualTextWithSingleItem(`Card #${sequenceNumber}`),
            imageId: buildDummyUuid(sequenceNumber + 100),
            audioId: buildDummyUuid(sequenceNumber + 200),
        });

        return buildResult;
    });

const publishedRound = buildTestInstance(MemoryMatchRound, {
    id: roundId,
    cardBackImageId: buildDummyUuid(testCards.length + 10),
    isPublished: true,
    cards: testCards,
    name: buildMultilingualTextWithSingleItem('published round'),
});

const unpublishedRound = buildTestInstance(MemoryMatchRound, {
    id: buildDummyUuid(123),
    isPublished: false,
});

const mockDynamicDataTypeFinderService = {
    async bootstrapDynamicTypes() {
        return Promise.resolve();
    },
};

/**
 * TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-305]
 * Return unpublished rounds to admin users.
 */
describe(`when querying for a memory match round: fetch by Id`, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let memoryMatchRepository: IMemoryMatchRepository;

    const setItUp = async (testUserWithGroups: CoscradUserWithGroups) => {
        const mockConfigService = buildMockConfigService(
            {
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                NODE_PORT: 5555,
                GLOBAL_PREFIX: 'test_api',
                BASE_URL: 'http://localhost',
            },
            buildConfigFilePath(Environment.test)
        );

        const testModuleRef = await Test.createTestingModule({
            imports: [
                PersistenceModule.forRootAsync(),
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(process.env.NODE_ENV),
                    cache: false,
                }),
                AuthorizationModule,
                MemoryMatchModule,
            ],
        })
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(new MockJwtAuthGuard(testUserWithGroups, true))
            .overrideGuard(AdminJwtGuard)
            .useValue(new MockJwtAdminAuthGuard(testUserWithGroups))
            .overrideProvider(ConfigService)
            .useValue(mockConfigService)
            .overrideProvider(DynamicDataTypeFinderService)
            .useValue(mockDynamicDataTypeFinderService)
            .compile();

        app = testModuleRef.createNestApplication();

        await app.init();

        memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);
    };

    beforeEach(async () => {
        databaseProvider = app.get(ArangoDatabaseProvider);

        await databaseProvider.getDatabaseForCollection(MEMORY_MATCH_ROUNDS).clear();

        await memoryMatchRepository.createMany([publishedRound, unpublishedRound]);
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            await setItUp(undefined);
        });

        describe(`when there is a memory match round with the given ID`, () => {
            describe(`when the round is public`, () => {
                it(`should return the expected response`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(roundId)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body).toMatchSnapshot();
                });
            });

            describe(`when the memory match round is private`, () => {
                it(`should return not found`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(unpublishedRound.id)
                    );

                    expect(res.status).toBe(HttpStatusCode.notFound);
                });
            });
        });

        describe(`when there is no memory match round with the given ID`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).get(buildDetailEndpoint('bogus-Id'));

                expect(res.status).toBe(HttpStatusCode.notFound);
            });
        });
    });

    describe(`when the user is authenticated as a viewer`, () => {
        beforeAll(async () => {
            const ordinaryUser = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.viewer],
            });

            await setItUp(new CoscradUserWithGroups(ordinaryUser, []));
        });

        describe(`when there is a memory match round with the given ID`, () => {
            describe(`when the round is public`, () => {
                it(`should return the expected response`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(roundId)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body).toMatchSnapshot();
                });
            });

            describe(`when the memory match round is private`, () => {
                it(`should return not found`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(unpublishedRound.id)
                    );

                    expect(res.status).toBe(HttpStatusCode.notFound);
                });
            });
        });
    });

    describe(`when the user is authenticated as a coscrad admin`, () => {
        beforeAll(async () => {
            const coscradAdmin = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.superAdmin],
            });

            await setItUp(new CoscradUserWithGroups(coscradAdmin, []));
        });

        describe(`when the memory match round is private`, () => {
            it(`should return the expected result`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(unpublishedRound.id)
                );

                expect(res.status).toBe(HttpStatusCode.ok);
            });
        });
    });

    describe(`when the user is authenticated as a project admin`, () => {
        beforeAll(async () => {
            const projectAdmin = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.projectAdmin],
            });

            await setItUp(new CoscradUserWithGroups(projectAdmin, []));
        });

        describe(`when the memory match round is private`, () => {
            it(`should return the expected result`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(unpublishedRound.id)
                );

                expect(res.status).toBe(HttpStatusCode.ok);
            });
        });
    });
});
