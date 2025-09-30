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
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
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

const MAX_NUMBER_OF_CARDS = 12;

const indexEndpoint = `/games/memory-match`;

const publishedRound = buildTestInstance(MemoryMatchRound, {
    id: buildDummyUuid(1),
    isPublished: true,
    name: buildMultilingualTextWithSingleItem('published round'),
    cards: Array(MAX_NUMBER_OF_CARDS)
        .fill(null)
        .map((_, index) => {
            const sequenceNumber = index + 1;

            return buildTestInstance(MemoryMatchCard, {
                sequenceNumber,
                audioId: buildDummyUuid(100 + sequenceNumber),
                imageId: buildDummyUuid(200 + sequenceNumber),
                text: buildMultilingualTextWithSingleItem(`Card #${sequenceNumber}`),
            });
        }),
});

const unpublishedRound = buildTestInstance(MemoryMatchRound, {
    id: buildDummyUuid(2),
    isPublished: false,
    name: buildMultilingualTextWithSingleItem('unpublished round'),
    cards: [],
});

// TODO we need to opt-back in once we diagnose why this fails on the CI but not locally
describe.skip(`when querying for a memory match round: fetch many`, () => {
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
            .compile();

        app = testModuleRef.createNestApplication();

        await app.init();

        memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);
    };

    beforeEach(async () => {
        databaseProvider = app.get(ArangoDatabaseProvider);

        await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();

        await memoryMatchRepository.createMany([publishedRound, unpublishedRound]);
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    /**
     * TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-305]
     * Return unpublished rounds to admin users.
     */
    describe(`when the user is unauthenticated (public queries)`, () => {
        beforeAll(async () => {
            await setItUp(undefined);
        });

        /**
         * TODO[https://github.com/COSCRAD/coscrad/pull/767#discussion_r2322689102]
         * Support custom user-defined filters and an active-search flow.
         */
        describe(`when no filters are provided`, () => {
            it(`should return all published rounds`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.ok);

                const {
                    body: { entities },
                } = res;

                // there is one published round visible to a public user
                expect(entities).toHaveLength(1);

                // ensure the published round is the one that was returned
                expect(entities[0].id).toBe(publishedRound.id);

                // this is a contract test to ensure we don't break the client
                expect(entities).toMatchSnapshot();
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

        describe(`when no filters are provided`, () => {
            it(`should return all published rounds`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.ok);

                const {
                    body: { entities },
                } = res;

                // there should be one round visible to a viewer user
                expect(entities).toHaveLength(1);

                expect(entities[0].id).toBe(publishedRound.id);
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

        describe(`when no filters are provided`, () => {
            it(`should return all published and unpublished rounds`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.ok);

                const {
                    body: { entities },
                } = res;

                // there should be two rounds visible to an admin user
                expect(entities).toHaveLength(2);

                expect(entities[0].id).toBe(publishedRound.id);

                expect(entities[1].id).toBe(unpublishedRound.id);
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

        describe(`when no filters are provided`, () => {
            it(`should return all published and unpublished rounds`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.ok);

                const {
                    body: { entities },
                } = res;

                // there should be two rounds visible to an admin user
                expect(entities).toHaveLength(2);

                expect(entities[0].id).toBe(publishedRound.id);

                expect(entities[1].id).toBe(unpublishedRound.id);
            });
        });
    });
});
