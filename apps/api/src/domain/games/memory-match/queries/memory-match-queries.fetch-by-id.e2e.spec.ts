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
import { AggregateId } from '../../../types/AggregateId';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchCard } from '../models/memory-match-card.entity';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

const buildDetailEndpoint = (id: AggregateId) => `/games/memory-match/${id}`;

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
});

describe(`when querying for a memory match round: fetch by Id`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let memoryMatchRepository: IMemoryMatchRepository;

    beforeEach(async () => {
        // TODO use a constant for the collection name
        await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();

        await memoryMatchRepository.create(publishedRound);
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

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
                        ARANGO_DB_NAME: testDatabaseName,
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
                const privateRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(123),
                    isPublished: false,
                });

                beforeEach(async () => {
                    await memoryMatchRepository.create(privateRound);
                });

                it(`should return not found`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(privateRound.id)
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
});
