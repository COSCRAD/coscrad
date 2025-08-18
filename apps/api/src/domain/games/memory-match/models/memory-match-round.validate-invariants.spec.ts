import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import {
    CannotExceedMemoryMatchRoundCapacityError,
    DuplicateSequeneceNumberForCardsError,
} from '../errors';
import { MemoryMatchCard } from './memory-match-card.entity';
import { MemoryMatchRound } from './memory-match-round.entity';

const MAX_NUMBER_OF_CARDS = 12;

const testRoundId = buildDummyUuid(1);

const buildCard = (sequenceNumber: number) =>
    new MemoryMatchCard({
        audioId: buildDummyUuid(sequenceNumber + 100),
        imageId: buildDummyUuid(sequenceNumber + 200),
        text: buildMultilingualTextWithSingleItem(`text for card #${sequenceNumber}`),
    });

const validCards = Array(MAX_NUMBER_OF_CARDS).map((_, sequenceNumber) => buildCard(sequenceNumber));

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
                it.todo(`should return the expected error`);
            });

            describe(`when there are less cards than the size requires`, () => {
                it.todo(`should return the expected error`);
            });

            describe(`when one of the cards is missing its image`, () => {
                it.todo(`should return the expected error`);
            });

            describe(`when one of the cards is missing its audio`, () => {
                it.todo(`should return the expected error`);
            });
        });

        describe(`when the schema is invalid`, () => {
            it.todo(`should have a fuzz test`);
        });
    });
});
