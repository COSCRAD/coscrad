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
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { AggregateId } from '../../../types/AggregateId';
import { MemoryMatchModule } from '../memory-match.module';
import {
    IMemoryMatchRepository,
    MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
} from '../memory-match.repository.interface';
import { MemoryMatchRound } from '../models/memory-match-round.entity';

const buildDetailEndpoint = (id: AggregateId) => `/games/memory-match/${id}`;

const roundId = buildDummyUuid(34);

describe(`when querying for a memory match: fetch by Id`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let memoryMatchRepository: IMemoryMatchRepository;

    beforeEach(async () => {
        // TODO use a constant for the collection name
        await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();
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
                .useValue(buildMockConfigService({ ARANGO_DB_NAME: testDatabaseName }))
                .compile();

            app = testModule.createNestApplication();

            await app.init();

            databaseProvider = app.get(ArangoDatabaseProvider);

            memoryMatchRepository = app.get(MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN);
        });

        describe(`when there is a memory match round with the given ID`, () => {
            describe(`when the round is public`, () => {
                beforeEach(async () => {
                    await memoryMatchRepository.create(
                        buildTestInstance(MemoryMatchRound, {
                            id: roundId,
                            isPublished: true,
                        })
                    );
                });

                it(`should return the expected response`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(roundId)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);
                });
            });
        });
    });
});
