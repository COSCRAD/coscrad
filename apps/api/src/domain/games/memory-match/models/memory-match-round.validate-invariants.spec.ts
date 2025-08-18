import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import {
    CannotExceedMemoryMatchRoundCapacityError,
    DuplicateSequeneceNumberForCardsError,
    InsufficientNumberOfCardsForPublicationError,
    MemoryRoundIsNotReadyForPublicationError,
    MissingAudioForMemoryMatchCardError,
    MissingCardbackErrorForMemoryMatchRound,
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
        it(`should return an empty list of errors`, () => {
            const validRound = new MemoryMatchRound({
                id: testRoundId,
                cardBackImageId,
                cards: validCards,
            });

            const result = validRound.validateInvariants();

            expect(result).toEqual([]);
        });
    });

    describe(`when the round is invalid`, () => {
        describe(`when the number of cards is greater than the size`, () => {
            it(`should return the expected error`, () => {
                const tooManyCards = Array(MAX_NUMBER_OF_CARDS + 1).map((_, sequenceNumber) =>
                    buildCard(sequenceNumber)
                );

                const round = new MemoryMatchRound({
                    id: testRoundId,
                    cardBackImageId,
                    cards: tooManyCards,
                });

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
                const round = new MemoryMatchRound({
                    id: testRoundId,
                    cardBackImageId,
                    cards: [buildCard(duplicateSequenceNumber), buildCard(duplicateSequenceNumber)],
                });

                const result = round.validateInvariants();

                expect(result).toHaveLength(1);

                assertErrorAsExpected(
                    result[0],
                    new DuplicateSequeneceNumberForCardsError(round.id, duplicateSequenceNumber)
                );
            });
        });

        describe(`when the round is published`, () => {
            describe(`when the cardback image is missing`, () => {
                it(`should return the expected error`, () => {
                    const roundWithoutCardbackImage = new MemoryMatchRound({
                        id: testRoundId,
                        isPublished: true,
                        // cardBackImageId,
                        cards: validCards,
                    });

                    const result = roundWithoutCardbackImage.validateInvariants();

                    expect(result).toHaveLength(1);

                    assertErrorAsExpected(
                        result[0],
                        new MemoryRoundIsNotReadyForPublicationError(roundWithoutCardbackImage.id, [
                            new MissingCardbackErrorForMemoryMatchRound(),
                        ])
                    );
                });
            });

            describe(`when there are less cards than the size requires`, () => {
                it(`should return the expected error`, () => {
                    const actualNumberOfCards = Math.floor(MAX_NUMBER_OF_CARDS / 2);

                    const tooFewCards = validCards.slice(0, actualNumberOfCards);

                    const roundWithTooFewCards = new MemoryMatchRound({
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

                    // TODO use `buildTestInstance`
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

                    const roundWithBadCard = new MemoryMatchRound({
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

                    const roundWithBadCard = new MemoryMatchRound({
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
            it.todo(`should have a fuzz test`); // TODO Blake
        });
    });
});
