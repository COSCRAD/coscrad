import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import {
    CannotOverwriteAudioForMemoryMatchCardError,
    CannotOverwriteCardbackImageForMemoryMatchRoundError,
    CannotOverwriteImageForMemoryMatchCardError,
    CannotOverwriteTextForMemoryMatchCardError,
    FailedToRepublishMemoryMatchRoundError,
    FailedToUnpublishDraftMemoryMatchRoundError,
    FailedToUpdateMissingMemoryMatchCardError,
    MemoryMatchRoundCapacityReachedError,
} from '../errors';
import { CannotRemoveUnknownCardFromMemoryMatchRoundError } from '../errors/cannot-remove-unknown-card-from-memory-match-round.error';
import { FailedToRemoveCardFromPublishedMemoryMatchRoundError } from '../errors/FailedToRemoveCardFromPublishedMemoryMatchRoundError';
import { MemoryMatchCard } from './memory-match-card.entity';
import { MemoryMatchRound } from './memory-match-round.entity';

const testMediaItemId = buildDummyUuid(1);

const testRoundId = buildDummyUuid(3);

const testRoundSize = 12;

const dtoForPublishableRound = {
    id: testRoundId,
    cardBackImageId: buildDummyUuid(120),
    cards: Array(testRoundSize).map((_, i) =>
        buildTestInstance(MemoryMatchCard, {
            sequenceNumber: i + 1,
            text: buildMultilingualTextWithSingleItem(`card #${i + 1}`),
            audioId: buildDummyUuid(101 + i),
            imageId: buildDummyUuid(201 + i),
        })
    ),
};

describe(`MemoryMatchRound`, () => {
    describe(`addCardBackImage`, () => {
        describe(`when the update is valid`, () => {
            it(`should add the cardback image`, () => {
                const testRound = buildTestInstance(MemoryMatchRound, {
                    id: testRoundId,
                    cardBackImageId: null,
                });

                const result = testRound.addCardbackImage(testMediaItemId);

                expect(result).not.toBeInstanceOf(Error);

                const updatedRound = result as MemoryMatchRound;

                expect(updatedRound.cardBackImageId).toBe(testMediaItemId);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`the round already has a card back image`, () => {
                it(`should return the expected error`, () => {
                    const testRound = buildTestInstance(MemoryMatchRound, {
                        id: testRoundId,
                        cardBackImageId: null,
                    }).addCardbackImage(testMediaItemId) as MemoryMatchRound;

                    const secondMediaItemId = buildDummyUuid(5);

                    const updateResult = testRound.addCardbackImage(secondMediaItemId);

                    assertErrorAsExpected(
                        updateResult,
                        new CannotOverwriteCardbackImageForMemoryMatchRoundError(
                            testRound.id,
                            testMediaItemId,
                            secondMediaItemId
                        )
                    );
                });
            });
        });
    });

    describe(`addImageForCard`, () => {
        describe(`when the update is valid`, () => {
            it(`should add the image to the card`, () => {
                const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

                const sequenceNumber = testRound.addCard() as number;

                testRound.addImageForCard(sequenceNumber, testMediaItemId);

                const targetCard = testRound.get(sequenceNumber) as MemoryMatchCard;

                expect(targetCard.imageId).toEqual(testMediaItemId);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`when the card already has a image`, () => {
                it(`should return the expected error`, () => {
                    const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

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

                    const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

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
                const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

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
                    const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

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
                    const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

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

    describe(`addTextForCard`, () => {
        describe(`when the update is valid`, () => {
            it(`should add the text`, () => {
                const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

                const sequenceNumber = testRound.addCard() as number;

                const testText = 'bird';

                const testLanguageCode = LanguageCode.English;

                const updateResult = testRound.addTextForCard(
                    sequenceNumber,
                    testText,
                    testLanguageCode
                );

                expect(updateResult).toBeInstanceOf(MemoryMatchRound);

                const updatedRound = updateResult as MemoryMatchRound;

                const targetCard = updatedRound.get(sequenceNumber) as MemoryMatchCard;

                expect(targetCard.text).toBeTruthy();

                const { text, languageCode, role } = targetCard.text.getOriginalTextItem();

                expect(text).toBe(testText);

                expect(languageCode).toBe(testLanguageCode);

                expect(role).toBe(MultilingualTextItemRole.original);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`When there is no card with the given sequence number.`, () => {
                it(`should return the expected error`, () => {
                    const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

                    const bogusSequenceNumber = 5;

                    const updateResult = testRound.addTextForCard(
                        bogusSequenceNumber,
                        'foo',
                        LanguageCode.English
                    );

                    assertErrorAsExpected(
                        updateResult,
                        new FailedToUpdateMissingMemoryMatchCardError(
                            testRound.id,
                            bogusSequenceNumber
                        )
                    );
                });
            });

            describe(`when the card already has text`, () => {
                it(`should return the expected error`, () => {
                    const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

                    const sequenceNumber = testRound.addCard() as number;

                    const existingText = 'bird';

                    const testLanguageCode = LanguageCode.English;

                    const roundWithTextForCard = testRound.addTextForCard(
                        sequenceNumber,
                        existingText,
                        testLanguageCode
                    ) as MemoryMatchRound;

                    const duplicateText = 'bla bla bla part II';

                    const updateResult = roundWithTextForCard.addTextForCard(
                        sequenceNumber,
                        duplicateText,
                        testLanguageCode
                    );

                    assertErrorAsExpected(
                        updateResult,
                        new CannotOverwriteTextForMemoryMatchCardError(
                            testRound.id,
                            sequenceNumber,
                            new MultilingualText({
                                items: [
                                    {
                                        text: existingText,
                                        languageCode: testLanguageCode,
                                        role: MultilingualTextItemRole.original,
                                    },
                                ],
                            }),
                            duplicateText,
                            testLanguageCode
                        )
                    );
                });
            });
        });
    });

    describe(`addCard`, () => {
        describe(`when the update is valid`, () => {
            describe(`when the round doesn't have any cards`, () => {
                it(`should add a new card with the expected sequenece number`, () => {
                    const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

                    const sequenceNumber = testRound.addCard();

                    expect(sequenceNumber).toBe(1);
                });
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`when the round already has the maximum number of cards`, () => {
                it(`should return the expected error`, () => {
                    const testRound = buildTestInstance(MemoryMatchRound, { id: testRoundId });

                    const MAX_NUMBER_OF_CARDS = 12;

                    for (let i = 1; i <= MAX_NUMBER_OF_CARDS; i++) {
                        const sequenceNumber = testRound.addCard();

                        expect(sequenceNumber).toBe(i);
                    }

                    // the round is now full
                    const resultOfAddingOneTooManyCards = testRound.addCard();

                    assertErrorAsExpected(
                        resultOfAddingOneTooManyCards,
                        new MemoryMatchRoundCapacityReachedError(testRound.id, MAX_NUMBER_OF_CARDS)
                    );
                });
            });
        });
    });

    describe(`publish`, () => {
        describe(`when the update is valid`, () => {
            it(`should update the round's publication status`, () => {
                const testRound = buildTestInstance(MemoryMatchRound, dtoForPublishableRound);

                const updateResult = testRound.publish();

                expect(updateResult).not.toBeInstanceOf(Error);

                const updatedRound = updateResult as MemoryMatchRound;

                expect(updatedRound.isPublished).toBe(true);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`when the memory round is already published`, () => {
                it(`should return the expected error`, () => {
                    const testRound = buildTestInstance(
                        MemoryMatchRound,
                        dtoForPublishableRound
                    ).publish() as MemoryMatchRound;

                    const updateResult = testRound.publish();

                    assertErrorAsExpected(
                        updateResult,
                        new FailedToRepublishMemoryMatchRoundError(testRound.id)
                    );
                });
            });

            describe(`when the memory round does not satisfy publication rules`, () => {
                it(`should have test cases`, () => {
                    const testRound = buildTestInstance(MemoryMatchRound, {
                        id: testRoundId,
                        cardBackImageId: null,
                        cards: [
                            buildTestInstance(MemoryMatchCard, {
                                sequenceNumber: 1,
                            }),
                        ],
                    });

                    const result = testRound.publish();

                    expect(result).toBeInstanceOf(InternalError);
                });
            });
        });
    });

    describe(`unpublish`, () => {
        describe(`when the update is valid`, () => {
            it(`should update the publication status`, () => {
                const testRound = buildTestInstance(
                    MemoryMatchRound,
                    dtoForPublishableRound
                ).publish() as MemoryMatchRound;

                const updateResult = testRound.unpublish();

                expect(updateResult).toBeInstanceOf(MemoryMatchRound);

                expect((updateResult as MemoryMatchRound).isPublished).toBe(false);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`when the round is not published to begin with`, () => {
                it(`should return the expected error`, () => {
                    const testRound = buildTestInstance(MemoryMatchRound, {
                        id: testRoundId,
                    });

                    const updateResult = testRound.unpublish();

                    assertErrorAsExpected(
                        updateResult,
                        new FailedToUnpublishDraftMemoryMatchRoundError(testRound.id)
                    );
                });
            });
        });
    });

    describe(`remove`, () => {
        describe(`when the update is valid`, () => {
            const targetSequenceNumber = 1;

            const cardToRemove = buildTestInstance(MemoryMatchCard, {
                sequenceNumber: targetSequenceNumber,
            });

            const cardToKeep = buildTestInstance(MemoryMatchCard, {
                sequenceNumber: targetSequenceNumber + 1,
            });

            it(`should remove the card`, async () => {
                const testRound = buildTestInstance(MemoryMatchRound, {
                    id: testRoundId,
                    cards: [cardToRemove, cardToKeep],
                });

                const updatedResult = testRound.remove(targetSequenceNumber);

                expect(updatedResult).not.toBeInstanceOf(InternalError);

                const updatedRound = updatedResult as MemoryMatchRound;

                expect(updatedRound.count()).toBe(1);
            });
        });

        describe(`when the update is invalid`, () => {
            describe(`when there is no card with the given sequence number`, () => {
                const validSequenceNumber = 1;

                const card = buildTestInstance(MemoryMatchCard, {
                    sequenceNumber: validSequenceNumber,
                });

                const invalidSequenceNumber = 404;

                it(`should return the expected error`, async () => {
                    const testRound = buildTestInstance(MemoryMatchRound, {
                        id: testRoundId,
                        cards: [card],
                    });

                    const updatedResult = testRound.remove(invalidSequenceNumber);

                    expect(updatedResult).toBeInstanceOf(InternalError);

                    assertErrorAsExpected(
                        updatedResult,
                        new CannotRemoveUnknownCardFromMemoryMatchRoundError(
                            testRound.id,
                            invalidSequenceNumber
                        )
                    );

                    expect(testRound.count()).toBe(1);
                });
            });
        });

        describe(`when the round is already published`, () => {
            const sequenceNumber = 2;

            const card = buildTestInstance(MemoryMatchCard, {
                sequenceNumber,
            });

            it(`should fail with the expected error`, async () => {
                const testRound = buildTestInstance(MemoryMatchRound, {
                    id: testRoundId,
                    cards: [card],
                    isPublished: true,
                });

                const updatedResult = testRound.remove(sequenceNumber);

                assertErrorAsExpected(
                    updatedResult,
                    new FailedToRemoveCardFromPublishedMemoryMatchRoundError(
                        testRound.id,
                        sequenceNumber
                    )
                );
            });
        });
    });
});
