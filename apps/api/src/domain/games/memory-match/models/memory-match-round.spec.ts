import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import {
    CannotOverwriteAudioForMemoryMatchCardError,
    CannotOverwriteImageForMemoryMatchCardError,
    FailedToUpdateMissingMemoryMatchCardError,
} from '../errors';
import { MemoryMatchCard } from './memory-match-card.entity';
import { MemoryMatchRound } from './memory-match-round.entity';

const testMediaItemId = buildDummyUuid(1);

const testRoundId = buildDummyUuid(3);

describe(`MemoryMatchRound`, () => {
    describe(`addImageForCard`, () => {
        describe(`when the update is valid`, () => {
            it(`should add the image to the card`, () => {
                const testRound = new MemoryMatchRound({ id: testRoundId });

                const sequenceNumber = testRound.addCard() as number;

                testRound.addImageForCard(sequenceNumber, testMediaItemId);

                const targetCard = testRound.get(sequenceNumber) as MemoryMatchCard;

                expect(targetCard.imageId).toEqual(testMediaItemId);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`when the card already has a image`, () => {
                it(`should return the expected error`, () => {
                    const testRound = new MemoryMatchRound({ id: testRoundId });

                    const sequenceNumber = testRound.addCard() as number;

                    const firstUpdate = testRound.addImageForCard(
                        sequenceNumber,
                        testMediaItemId
                    ) as MemoryMatchRound;

                    const secondMediaItemId = buildDummyUuid(2);

                    const result = firstUpdate.addImageForCard(sequenceNumber, secondMediaItemId);

                    assertErrorAsExpected(
                        result,
                        new CannotOverwriteImageForMemoryMatchCardError(
                            testRound.id,
                            sequenceNumber,
                            testMediaItemId,
                            secondMediaItemId
                        )
                    );
                });
            });

            describe(`when there is no card with the given sequence number`, () => {
                it(`should return the expected error`, () => {
                    const bogusSequenceNumber = 123;

                    const testRound = new MemoryMatchRound({ id: testRoundId });

                    const result = testRound.addImageForCard(123, testMediaItemId);

                    assertErrorAsExpected(
                        result,
                        new FailedToUpdateMissingMemoryMatchCardError(
                            testRoundId,
                            bogusSequenceNumber
                        )
                    );
                });
            });
        });
    });

    describe(`addAudioForCard`, () => {
        describe(`when the update is valid`, () => {
            it(`should add the audio`, () => {
                const testRound = new MemoryMatchRound({ id: testRoundId });

                //TODO should we return the entire card?
                const sequenceNumber = testRound.addCard() as number;

                const updateResult = testRound.addAudioForCard(sequenceNumber, testMediaItemId);

                expect(updateResult).toBeInstanceOf(MemoryMatchRound);

                const updatedRound = updateResult as MemoryMatchRound;

                const updatedCard = updatedRound.get(sequenceNumber) as MemoryMatchCard;

                expect(updatedCard.hasAudio()).toBe(true);

                expect(updatedCard.audioId).toBe(testMediaItemId);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`When there is no card with the given sequence number.`, () => {
                it(`should return the expected error`, () => {
                    const testRound = new MemoryMatchRound({ id: testRoundId });

                    const bogusSequenceNumber = 1;

                    const updateResult = testRound.addAudioForCard(
                        bogusSequenceNumber,
                        testMediaItemId
                    );

                    assertErrorAsExpected(
                        updateResult,
                        new FailedToUpdateMissingMemoryMatchCardError(
                            testRoundId,
                            bogusSequenceNumber
                        )
                    );
                });
            });

            describe(`when the card already has audio`, () => {
                it(`should return the expected error`, () => {
                    const testRound = new MemoryMatchRound({ id: testRoundId });

                    const sequenceNumber = testRound.addCard() as number;

                    const roundWithAudio = testRound.addAudioForCard(
                        sequenceNumber,
                        testMediaItemId
                    ) as MemoryMatchRound;

                    const secondMediaItemId = buildDummyUuid(5);

                    const updateResult = roundWithAudio.addAudioForCard(
                        sequenceNumber,
                        secondMediaItemId
                    );

                    assertErrorAsExpected(
                        updateResult,
                        new CannotOverwriteAudioForMemoryMatchCardError(
                            testRound.id,
                            sequenceNumber,
                            testMediaItemId,
                            secondMediaItemId
                        )
                    );
                });
            });
        });
    });

    describe(`addCardBackImage`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should add the card back image`);
        });

        describe(`when the update is invalid`, () => {
            describe(`the round already has a card back image`, () => {
                it.todo(`should return the expected error`);
            });

            describe(`when there is no card with the given sequence number`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });

    describe(`addTextForCard`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should add the text`);
        });

        describe(`when the update is invalid`, () => {
            describe(`When there is no card with the given sequence number.`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });

    describe(`addCard`, () => {
        describe(`when the update is valid`, () => {
            describe(`when the round doesn't have any cards`, () => {
                it.todo(`should add a new card with the expected sequenece number`);
            });

            describe(`when the round has one card`, () => {
                it.todo(`should add a new card with the expected sequenece number`);
            });

            describe(`when the round has one less than a full set of cards`, () => {
                it.todo(`should add a new card with the expected sequenece number`);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`when the round already has the maximum number of cards`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });

    describe(`publish`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should update the round's publication status`);
        });

        describe(`when the update is invalid`, () => {
            it.todo(`should have test cases`);
        });
    });

    describe(`unpublish`, () => {
        describe(`when the update is valid`, () => {
            it.todo(`should update the publication status`);
        });

        describe(`when the update is invalid`, () => {
            describe(`when the round is not published to begin with`, () => {
                it.todo(`should return the expected error`);
            });
        });
    });
});
