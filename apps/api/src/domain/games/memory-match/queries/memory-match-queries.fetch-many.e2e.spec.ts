import { HttpStatusCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
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
    cards: [],
});

describe(`when querying for a memory match round: fetch many`, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let memoryMatchRepository: IMemoryMatchRepository;

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();

        await memoryMatchRepository.createMany([publishedRound, unpublishedRound]);
    });

    /**
     * TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-305]
     * Return unpublished rounds to admin users.
     */
    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
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
                        BASE_URL: 'http://localhost',
                        NODE_PORT: 1234,
                        GLOBAL_PREFIX: 'awesome-api',
                    })
                )
                .compile();

            app = testModule.createNestApplication();

            await app.init();

            databaseProvider = app.get(ArangoDatabaseProvider);

            memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);
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
});
