import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import {
    CannotExceedMemoryMatchRoundCapacityError,
    DuplicateSequeneceNumberForCardsError,
    InsufficientNumberOfCardsForPublicationError,
    MemoryRoundIsNotReadyForPublicationError,
    MissingAudioForMemoryMatchCardError,
    MissingCardBackErrorForMemoryMatchRound,
    MissingImageForMemoryMatchCardError,
} from '../errors';
import { MemoryMatchCard } from './memory-match-card.entity';
import { MemoryMatchRound } from './memory-match-round.entity';

const MAX_NUMBER_OF_CARDS = 12;

const testRoundId = buildDummyUuid(1);

const buildCard = (sequenceNumber: number) =>
    new MemoryMatchCard({
        sequenceNumber,
        audioId: buildDummyUuid(sequenceNumber + 100),
        imageId: buildDummyUuid(sequenceNumber + 200),
        text: buildMultilingualTextWithSingleItem(`text for card #${sequenceNumber}`),
    });

const validCards = Array(MAX_NUMBER_OF_CARDS).map((_, index) => buildCard(index + 1));

const cardBackImageId = buildDummyUuid(21);

describe(`MemoryMatchRound.validateInvariants`, () => {
    describe(`when the round is valid`, () => {
        describe(`when the round is published`, () => {
            it(`should return an empty list of errors`, () => {
                const validPublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testRoundId,
                    isPublished: true,
                    cardBackImageId,
                    cards: validCards,
                });

                const result = validPublishedRound.validateInvariants();

                expect(result).toEqual([]);
            });
        });

        describe(`when the round is unpublished`, () => {
            it(`should return an empty list of errors`, () => {
                const validUnpublishedRound = buildTestInstance(MemoryMatchRound, {
                    id: testRoundId,
                    isPublished: false,
                    cardBackImageId: null,
                    cards: [buildTestInstance(MemoryMatchCard)],
                });

                const result = validUnpublishedRound.validateInvariants();

                expect(result).toHaveLength(0);
            });
        });
    });

    describe(`when the round is invalid`, () => {
        describe(`when the number of cards is greater than the size`, () => {
            it(`should return the expected error`, () => {
                const tooManyCards = Array(MAX_NUMBER_OF_CARDS + 1).map((_, sequenceNumber) =>
                    buildCard(sequenceNumber)
                );

                const round = buildTestInstance(
                    MemoryMatchRound,

                    {
                        id: testRoundId,
                        cardBackImageId,
                        cards: tooManyCards,
                    }
                );

                const result = round.validateInvariants();

                expect(result).toHaveLength(1);

                assertErrorAsExpected(
                    result[0],
                    new CannotExceedMemoryMatchRoundCapacityError(
                        round.id,
                        round.size,
                        tooManyCards.length
                    )
                );
            });
        });

        describe(`when two cards have the same sequence number`, () => {
            it(`should return the expected error`, () => {
                const duplicateSequenceNumber = 1;
                const round = buildTestInstance(
                    MemoryMatchRound,

                    {
                        id: testRoundId,
                        cardBackImageId,
                        cards: [
                            buildCard(duplicateSequenceNumber),
                            buildCard(duplicateSequenceNumber),
                        ],
                    }
                );

                const result = round.validateInvariants();

                expect(result).toHaveLength(1);

                assertErrorAsExpected(
                    result[0],
                    new DuplicateSequeneceNumberForCardsError(round.id, duplicateSequenceNumber)
                );
            });
        });

        describe(`when the round is published`, () => {
            describe(`when the card back image is missing`, () => {
                it(`should return the expected error`, () => {
                    const roundWithoutCardbackImage = buildTestInstance(
                        MemoryMatchRound,

                        {
                            id: testRoundId,
                            isPublished: true,
                            cardBackImageId: null,
                            cards: validCards,
                        }
                    );

                    const result = roundWithoutCardbackImage.validateInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(
                        result[0],
                        new MemoryRoundIsNotReadyForPublicationError(roundWithoutCardbackImage.id, [
                            new MissingCardBackErrorForMemoryMatchRound(),
                        ])
                    );
                });
            });

            describe(`when there are less cards than the size requires`, () => {
                it(`should return the expected error`, () => {
                    const actualNumberOfCards = MAX_NUMBER_OF_CARDS - 1;

                    const tooFewCards = validCards.slice(0, actualNumberOfCards);

                    const roundWithTooFewCards = buildTestInstance(MemoryMatchRound, {
                        id: testRoundId,
                        isPublished: true,
                        cardBackImageId,
                        cards: tooFewCards,
                    });

                    const result = roundWithTooFewCards.validateInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(
                        result[0],
                        new MemoryRoundIsNotReadyForPublicationError(roundWithTooFewCards.id, [
                            new InsufficientNumberOfCardsForPublicationError(
                                roundWithTooFewCards.size,
                                tooFewCards.length
                            ),
                        ])
                    );
                });
            });

            describe(`when one of the cards is missing its image`, () => {
                it(`should return the expected error`, () => {
                    const badSequenceNumber = 1;

                    const emptyArray = Array(MAX_NUMBER_OF_CARDS);

                    const invalidCards = emptyArray.fill(null).map((_, index) => {
                        const sequenceNumber = index + 1;

                        if (sequenceNumber === badSequenceNumber) {
                            return new MemoryMatchCard({
                                sequenceNumber,
                                audioId: buildDummyUuid(index + 100),
                                // imageId: buildDummyUuid(sequenceNumber + 200), // missing
                                text: buildMultilingualTextWithSingleItem(
                                    `text for card #${index}`
                                ),
                            });
                        }

                        const goodCard = buildCard(sequenceNumber);

                        return goodCard;
                    });

                    const roundWithBadCard = buildTestInstance(MemoryMatchRound, {
                        id: testRoundId,
                        isPublished: true,
                        cardBackImageId,
                        cards: invalidCards,
                    });

                    const result = roundWithBadCard.validateInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(
                        result[0],
                        new MemoryRoundIsNotReadyForPublicationError(roundWithBadCard.id, [
                            new MissingImageForMemoryMatchCardError(badSequenceNumber),
                        ])
                    );
                });
            });

            describe(`when one of the cards is missing its audio`, () => {
                it(`should return the expected error`, () => {
                    const badSequenceNumber = 1;

                    const emptyArray = Array(MAX_NUMBER_OF_CARDS);

                    // TODO use `buildTestInstance`
                    const invalidCards = emptyArray.fill(null).map((_, index) => {
                        const sequenceNumber = index + 1;

                        if (sequenceNumber === badSequenceNumber) {
                            return new MemoryMatchCard({
                                sequenceNumber,
                                // audioId: buildDummyUuid(index + 100), // missing
                                imageId: buildDummyUuid(sequenceNumber + 200),
                                text: buildMultilingualTextWithSingleItem(
                                    `text for card #${index}`
                                ),
                            });
                        }

                        const goodCard = buildCard(sequenceNumber);

                        return goodCard;
                    });

                    const roundWithBadCard = buildTestInstance(MemoryMatchRound, {
                        id: testRoundId,
                        isPublished: true,
                        cardBackImageId,
                        cards: invalidCards,
                    });

                    const result = roundWithBadCard.validateInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(
                        result[0],
                        new MemoryRoundIsNotReadyForPublicationError(roundWithBadCard.id, [
                            new MissingAudioForMemoryMatchCardError(badSequenceNumber),
                        ])
                    );
                });
            });
        });

        describe(`when the schema is invalid`, () => {
            describe(`fuzz test:`, () => {
                const dataSchema = getCoscradDataSchema(MemoryMatchRound);

                const testCases = Object.entries(dataSchema).flatMap(
                    ([propertyName, propertySchema]) =>
                        new FuzzGenerator(propertySchema)
                            .generateInvalidValues()
                            .map(({ value, description }) => ({
                                propertyName,
                                invalidValue: value,
                                description,
                            }))
                            .concat({
                                propertyName: 'bogusProperty',
                                invalidValue: ['I am oh so bogus!'],
                                description: 'superfluous (bogus) property key',
                            })
                );

                testCases
                    .filter(({ propertyName }) => propertyName === 'isPublished')
                    .forEach(({ propertyName, invalidValue, description }) => {
                        describe(`when the property: ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                            it(`should return a type error`, () => {
                                const invalidDto = cloneToPlainObject({
                                    ...buildTestInstance(MemoryMatchRound),
                                    [propertyName]: invalidValue,
                                });

                                const invalidInstance = new MemoryMatchRound(invalidDto);

                                const result = invalidInstance.validateInvariants();

                                expect(result.length).toBeGreaterThan(0);

                                const joinedMessages = result.map((r) => r.toString()).join('\n');

                                expect(joinedMessages).toContain(propertyName);
                            });
                        });
                    });
            });
        });
    });
});
