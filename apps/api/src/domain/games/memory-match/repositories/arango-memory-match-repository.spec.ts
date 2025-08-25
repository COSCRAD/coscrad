import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { IMemoryMatchRepository } from '../memory-match.repository.interface';
import { MemoryMatchCard } from '../models/memory-match-card.entity';
import { MemoryMatchRound } from '../models/memory-match-round.entity';
import { ArangoMemoryMatchRepository } from './arango-memory-match-repository';

const buildRound = (n: number) => {
    return buildTestInstance(MemoryMatchRound, {
        id: buildDummyUuid(n),
        name: buildMultilingualTextWithSingleItem(`round #${n}`),
        cards: Array(12).map((_, index) =>
            buildTestInstance(MemoryMatchCard, {
                sequenceNumber: index + 1,
                text: buildMultilingualTextWithSingleItem(`text for card #${index + 1}`),
                audioId: buildDummyUuid(101 + index),
                imageId: buildDummyUuid(201 + index),
            })
        ),
    });
};

const testRoundSequentialIds = [1, 2, 3];

const testRounds = testRoundSequentialIds.map((s) => buildRound(s + 1));

describe(`ArangoMemoryMatchRepository`, () => {
    let testRepository: IMemoryMatchRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testRepository = new ArangoMemoryMatchRepository(connectionProvider);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        const testRound = testRounds[0];

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();

            await testRepository.create(testRound);
        });

        describe(`when there is a round with the given ID`, () => {
            it('should return with the expected updates', async () => {
                const result = await testRepository.fetchById(testRound.id);

                expect(result).not.toBe(NotFound);

                const { name, cardBackImageId, cards, compiledBy, contributors, isPublished } =
                    result as MemoryMatchRound;

                expect(name.toDTO()).toEqual(testRound.name.toDTO());

                expect(cardBackImageId).toBe(testRound.cardBackImageId);

                expect(isPublished).toBe(testRound.isPublished);

                expect(cards).toHaveLength(testRound.cards.length);

                expect(compiledBy).toHaveLength(testRound.compiledBy.length);

                expect(contributors).toHaveLength(testRound.contributors.length);
            });
        });

        describe(`when there is no round with the given ID`, () => {
            it.todo(`should have a test`);
        });
    });
});
