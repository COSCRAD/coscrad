import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import AggregateNotFoundError from '../../../models/shared/common-command-errors/AggregateNotFoundError';
import { MEMORY_MATCH_ROUND } from '../constants';
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

const NUMBER_OF_PAIRS_IN_A_ROUND = 12;

const testRoundSequentialIds = [1, 2, 3];

const testRounds = testRoundSequentialIds.map((s) => buildRound(s + 1));

const unpublishedRound = buildTestInstance(MemoryMatchRound, {
    id: buildDummyUuid(1),
    isPublished: false,
});

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

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('memory_match_rounds').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        const testRound = testRounds[0];

        beforeEach(async () => {
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
            it(`should return not found`, async () => {
                const result = await testRepository.fetchById('BOGUS_ID');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        describe(`when there are some existing rounds`, () => {
            beforeEach(async () => {
                await testRepository.createMany(testRounds);
            });

            it(`should fetch the rounds`, async () => {
                const result = await testRepository.fetchMany();

                expect(result).toHaveLength(testRounds.length);
            });
        });

        describe(`when there are no existing rounds`, () => {
            it(`should return an empty array`, async () => {
                const result = await testRepository.fetchMany();

                expect(result).toHaveLength(0);
            });
        });
    });

    describe(`count`, () => {
        describe(`when there are some existing rounds`, () => {
            beforeEach(async () => {
                await testRepository.createMany(testRounds);
            });

            it(`should return the correct count`, async () => {
                const result = await testRepository.count();

                expect(result).toBe(testRounds.length);
            });
        });

        describe(`when there are no existing rounds`, () => {
            it(`should return 0`, async () => {
                const result = await testRepository.count();

                expect(result).toBe(0);
            });
        });
    });

    describe(`publish`, () => {
        describe(`when the round exists`, () => {
            describe(`when the round is not yet published`, () => {
                beforeEach(async () => {
                    await testRepository.create(unpublishedRound);
                });

                it(`should publish the round`, async () => {
                    const result = await testRepository.publish(unpublishedRound.id);

                    const updatedRound = (await testRepository.fetchById(
                        unpublishedRound.id
                    )) as MemoryMatchRound;

                    expect(updatedRound.isPublished).toBe(true);

                    expect(result).toBe(unpublishedRound.id);
                });
            });

            // Note that the repository doesn't validate that the resource isn't already published, but publication is idempotent.
        });

        describe(`when the round does not exist`, () => {
            it(`should return the expected error`, async () => {
                const bogusId = 'there-is-no-round-with-this-id';

                const result = await testRepository.publish(bogusId);

                expect(result).toBeInstanceOf(InternalError);

                const { message: errorMessage } = result as InternalError;

                expect(errorMessage).toContain(`as there is no memory match round with`);

                expect(errorMessage).toContain(bogusId);
            });
        });
    });

    describe(`unpublish`, () => {
        const publishedRound = buildTestInstance(MemoryMatchRound, {
            id: buildDummyUuid(1),
            isPublished: true,
        });

        describe(`when the round is published`, () => {
            beforeEach(async () => {
                await testRepository.create(publishedRound);
            });

            it(`should unpublish the round`, async () => {
                await testRepository.unpublish(publishedRound.id);

                const updatedRound = (await testRepository.fetchById(
                    publishedRound.id
                )) as MemoryMatchRound;

                expect(updatedRound.isPublished).toBe(false);
            });
        });

        describe(`when the round does not exist`, () => {
            //    no data is added in a beforeEach
            it(`should fail with the expected error`, async () => {
                const result = await testRepository.unpublish(unpublishedRound.id);

                expect(result).toBeInstanceOf(InternalError);

                const { message: errorMessage } = result as InternalError;

                expect(errorMessage).toContain('there is no memory match round');

                expect(errorMessage).toContain(unpublishedRound.id);
            });
        });
    });

    describe(`delete`, () => {
        describe(`when the round exists`, () => {
            const roundToDelete = testRounds[0];

            beforeEach(async () => {
                await testRepository.createMany(testRounds);
            });

            it(`should delete the round`, async () => {
                await testRepository.delete(roundToDelete.id);

                const searchResult = await testRepository.fetchById(roundToDelete.id);

                expect(searchResult).toBe(NotFound);

                const allRounds = await testRepository.fetchMany();

                expect(allRounds).toHaveLength(testRounds.length - 1);

                // make sure the deleted round doesn't come through via fetchMany
                expect(allRounds.filter((round) => round.id === roundToDelete.id)).toHaveLength(0);

                const count = await testRepository.count();

                expect(count).toBe(testRounds.length - 1);
            });
        });

        describe(`when the round does not exist`, () => {
            it.todo(`should reject`);
        });
    });

    describe(`removeCard`, () => {
        describe(`when the request is valid`, () => {
            const assertCardGetsRemoved = async (
                testRound: MemoryMatchRound,
                sequenceNumber: number
            ) => {
                const originalNumberOfCards = testRound.count();

                await testRepository.create(testRound);

                const result = await testRepository.removeCard(testRound.id, sequenceNumber);

                expect(result).not.toBeInstanceOf(Error);

                const updatedRound = (await testRepository.fetchById(
                    testRound.id
                )) as MemoryMatchRound;

                expect(updatedRound.count()).toBe(originalNumberOfCards - 1);

                expect(updatedRound.has(sequenceNumber)).toBe(false);
            };

            describe(`when removing the only card from a round`, () => {
                it(`should remove the card`, async () => {
                    const targetSequenceNumber = 123;

                    const testRound = buildTestInstance(MemoryMatchRound, {
                        id: buildDummyUuid(1),
                        isPublished: false,
                        cards: [
                            buildTestInstance(MemoryMatchCard, {
                                sequenceNumber: targetSequenceNumber,
                            }),
                        ],
                    });

                    await assertCardGetsRemoved(testRound, targetSequenceNumber);
                });
            });

            describe(`when removing the last card from a round`, () => {
                it(`should remove the card`, async () => {
                    const targetSequenceNumber = 123;

                    const testRound = buildTestInstance(MemoryMatchRound, {
                        id: buildDummyUuid(1),
                        isPublished: false,
                        cards: Array(NUMBER_OF_PAIRS_IN_A_ROUND)
                            .fill(null)
                            .map((_, index) =>
                                buildTestInstance(MemoryMatchCard, {
                                    sequenceNumber:
                                        index == NUMBER_OF_PAIRS_IN_A_ROUND - 1
                                            ? targetSequenceNumber
                                            : index + 1,
                                })
                            ),
                    });

                    await assertCardGetsRemoved(testRound, targetSequenceNumber);
                });
            });

            describe(`when removing the middle card from the list`, () => {
                it(`should remove the card`, async () => {
                    const targetSequenceNumber = 123;

                    const testRound = buildTestInstance(MemoryMatchRound, {
                        id: buildDummyUuid(1),
                        isPublished: false,
                        cards: Array(NUMBER_OF_PAIRS_IN_A_ROUND)
                            .fill(null)
                            .map((_, index) =>
                                buildTestInstance(MemoryMatchCard, {
                                    sequenceNumber:
                                        index == Math.floor(NUMBER_OF_PAIRS_IN_A_ROUND / 2)
                                            ? targetSequenceNumber
                                            : index + 1,
                                })
                            ),
                    });

                    await assertCardGetsRemoved(testRound, targetSequenceNumber);
                });
            });
        });

        describe(`when the request is invalid`, () => {
            describe(`when the round does not exist`, () => {
                it(`should return the expected error`, async () => {
                    const missingId = buildDummyUuid(123);

                    const sequenceNumber = 1;

                    const result = await testRepository.removeCard(missingId, sequenceNumber);

                    assertErrorAsExpected(
                        result,
                        new AggregateNotFoundError({ type: MEMORY_MATCH_ROUND, id: missingId })
                    );
                });
            });

            describe(`when there is no card with the given sequence number`, () => {
                const missingSequenceNumber = 123;

                const testRound = buildTestInstance(MemoryMatchRound, {
                    id: buildDummyUuid(1),
                    isPublished: false,
                    cards: [1, 2, 3].map((sequenceNumber) =>
                        buildTestInstance(MemoryMatchCard, {
                            sequenceNumber,
                        })
                    ),
                });

                beforeEach(async () => {
                    await testRepository.create(testRound);
                });

                it(`should return the expected error`, async () => {
                    const result = await testRepository.removeCard(
                        testRound.id,
                        missingSequenceNumber
                    );

                    assertErrorAsExpected(
                        result,
                        new AggregateNotFoundError(testRound.getCompositeIdentifier())
                    );
                });
            });

            // TODO should the repository prevent modifying a published resource?
        });
    });

    describe(`create`, () => {
        const testRound = buildTestInstance(MemoryMatchRound, {
            id: buildDummyUuid(123),
        });

        describe(`when there is no existing memory match round with the given ID or name`, () => {
            it(`should create the round`, async () => {
                await testRepository.create(testRound);

                const searchResult = await testRepository.fetchById(testRound.id);

                expect(searchResult).toBeInstanceOf(MemoryMatchRound);
            });
        });

        describe(`when there is already a memory match round with the given ID`, () => {
            it(`should return the expected error`, async () => {
                await testRepository.create(testRound);

                const result = await testRepository.create(testRound);

                const fullMessage = result.toString();

                expect(result).toBeInstanceOf(InternalError);

                expect(fullMessage).toContain(`There is already a memory match round with the ID`);

                expect(fullMessage).toContain(testRound.id);
            });
        });

        describe(`when there is already a memory match round with the given Name`, () => {
            it(`should return the expected error`, async () => {
                const duplicateName = 'fooBarBaz';

                await testRepository.create(
                    buildTestInstance(MemoryMatchRound, {
                        id: buildDummyUuid(89),
                        name: buildMultilingualTextWithSingleItem(duplicateName),
                    })
                );

                const result = await testRepository.create(
                    buildTestInstance(MemoryMatchRound, {
                        // distinct
                        id: buildDummyUuid(90),
                        // duplicated
                        name: buildMultilingualTextWithSingleItem(duplicateName),
                    })
                );

                expect(result).toBeInstanceOf(InternalError);

                const fullMessage = result.toString();

                // as part of the message
                expect(fullMessage).toContain(
                    `There is already a memory match round with the name`
                );

                // the actual value of the duplicated name
                expect(fullMessage).toContain(duplicateName);
            });
        });
    });
});
