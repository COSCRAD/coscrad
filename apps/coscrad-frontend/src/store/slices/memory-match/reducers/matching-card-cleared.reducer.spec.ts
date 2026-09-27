import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { MemoryMatchActiveCard } from '../types/memory-match-active-card';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';
import { matchingCardsClearedReducer } from './matching-cards-cleared.reducer';

const N_UNIQUE_CARDS = 12;

const TOTAL_CARDS = 2 * N_UNIQUE_CARDS;

const N_ROWS = 6;

const N_COLUMNS = TOTAL_CARDS / N_ROWS;

const buildCard = (
    row: number,
    column: number,
    state: MemoryMatchCardActiveState
): MemoryMatchActiveCard => {
    const sequenceNumber = row * N_COLUMNS + column;

    return {
        row,
        column,
        sequenceNumber,
        audioUrl: `https://www.mylalala.com/${sequenceNumber + 1}.mp3`,
        imageUrl: `https://www.mypicstorage.com/${sequenceNumber + 1}.png`,
        state,
    };
};

const oneCopyOfCards: MemoryMatchActiveCard[][] = Array(N_ROWS / 2)
    .fill(null)
    .map((_, row) =>
        Array(N_COLUMNS)
            .fill(null)
            .map((_, col) => buildCard(row, col, MemoryMatchCardActiveState.FACE_DOWN))
    );

const secondCopyOfCards: MemoryMatchActiveCard[][] = oneCopyOfCards.map((row) =>
    row.map((card) => {
        const result = {
            ...JSON.parse(JSON.stringify(card)),
            row: card.row + N_ROWS / 2,
            column: card.column,
        };

        return result;
    })
);

const bothCopiesOfCards = [...oneCopyOfCards, ...secondCopyOfCards];

const targetSequenceNumber = 0;

const cardsWithTargetSequenceNumber = bothCopiesOfCards.flatMap((row) =>
    row.flatMap((c) => (c.sequenceNumber === targetSequenceNumber ? [c] : []))
);

if (cardsWithTargetSequenceNumber.length !== 2) {
    throw new Error(
        `Invalid test setup. Expected two cards with sequence number: ${targetSequenceNumber}, but recieved: ${cardsWithTargetSequenceNumber.length}`
    );
}

const allFaceDownState: MemoryMatchActiveRound = {
    id: '123',
    name: {
        items: [
            {
                languageCode: LanguageCode.English,
                text: 'My Test Round',
                role: MultilingualTextItemRole.original,
            },
        ],
    },
    cardbackImageUrl: 'https://www.mycdn.com/123.png',
    contributors: [],
    size: 12,
    rows: bothCopiesOfCards,
};

const [alreadyFaceUpCard, cardThatMatchesAlreadyFaceUpCard] = cardsWithTargetSequenceNumber;

const act = (
    initialState: MemoryMatchActiveRound,
    payload: { sequenceNumber: number },
    checkResult: (newState: MemoryMatchActiveRound) => void
) => {
    const input = JSON.parse(JSON.stringify(initialState));

    const result = matchingCardsClearedReducer(input, {
        type: 'CARD_FLIPPED',
        payload,
    });

    checkResult(result);
};

const oneFaceUpState = {
    ...JSON.parse(JSON.stringify(allFaceDownState)),
    rows: allFaceDownState.rows.map((r, ri) => {
        const resultingRow = r.map((card, ci) => {
            if (ri === alreadyFaceUpCard.row && ci === alreadyFaceUpCard.column) {
                const faceUpCard = {
                    ...JSON.parse(JSON.stringify(card)),
                    state: MemoryMatchCardActiveState.FACE_UP,
                };

                return faceUpCard;
            }

            return card;
        });

        return resultingRow;
    }),
};

const twoFaceUpState = {
    ...JSON.parse(JSON.stringify(allFaceDownState)),
    rows: oneFaceUpState.rows.map((r, ri) => {
        const resultingRow = r.map((card, ci) => {
            if (
                ri === cardThatMatchesAlreadyFaceUpCard.row &&
                ci === cardThatMatchesAlreadyFaceUpCard.column
            ) {
                const faceUpCard = {
                    ...JSON.parse(JSON.stringify(card)),
                    state: MemoryMatchCardActiveState.FACE_UP,
                };

                return faceUpCard;
            }

            return card;
        });

        return resultingRow;
    }),
};

const targetPairOnlyClearedState = {
    ...JSON.parse(JSON.stringify(allFaceDownState)),
    rows: allFaceDownState.rows.map((r, ri) => {
        const resultingRow = r.map((card, ci) => {
            if (
                isDeepStrictEqual([ri, ci], [alreadyFaceUpCard.row, alreadyFaceUpCard.column]) ||
                isDeepStrictEqual(
                    [ri, ci],
                    [cardThatMatchesAlreadyFaceUpCard.row, cardThatMatchesAlreadyFaceUpCard.column]
                )
            ) {
                const faceUpCard = {
                    ...JSON.parse(JSON.stringify(card)),
                    state: MemoryMatchCardActiveState.CLEARED,
                };

                return faceUpCard;
            }

            return card;
        });

        return resultingRow;
    }),
};

describe(`cardClearedReducer`, () => {
    describe(`when no cards have been cleared`, () => {
        describe(`when the target cards are face-up`, () => {
            it(`should clear the 2 target cards`, () => {
                act(
                    twoFaceUpState,
                    {
                        sequenceNumber: targetSequenceNumber,
                    },
                    (result) => {
                        expect(result).toEqual(targetPairOnlyClearedState);
                    }
                );
            });
        });

        describe(`when only one of the target cards is face-up`, () => {
            it(`should leave the state unchanged`, () => {
                act(
                    oneFaceUpState,
                    {
                        sequenceNumber: targetSequenceNumber,
                    },
                    (result) => {
                        expect(result).toEqual(oneFaceUpState);
                    }
                );
            });
        });

        describe(`when no cards are face-up`, () => {
            it(`should leave the state unchanged`, () => {
                act(
                    allFaceDownState,
                    {
                        sequenceNumber: targetSequenceNumber,
                    },
                    (result) => {
                        expect(result).toEqual(allFaceDownState);
                    }
                );
            });
        });
    });

    describe(`when other cards have been cleared and the target cards are face-up`, () => {
        const clearedSequenceNumber = 5;

        const clearedCards = bothCopiesOfCards.flatMap((row) =>
            row.flatMap((c) => (c.sequenceNumber === clearedSequenceNumber ? [c] : []))
        );

        const stateWithOtherCardsCleared = {
            ...JSON.parse(JSON.stringify(twoFaceUpState)),
            rows: twoFaceUpState.rows.map((r, ri) => {
                const resultingRow = r.map((card, ci) => {
                    if (
                        isDeepStrictEqual(
                            [ri, ci],
                            [clearedCards[0].row, clearedCards[0].column]
                        ) ||
                        isDeepStrictEqual([ri, ci], [clearedCards[1].row, clearedCards[1].column])
                    ) {
                        const cleared = {
                            ...JSON.parse(JSON.stringify(card)),
                            state: MemoryMatchCardActiveState.CLEARED,
                        };

                        return cleared;
                    }

                    return card;
                });

                return resultingRow;
            }),
        };

        const fourClearedState = {
            ...JSON.parse(JSON.stringify(allFaceDownState)),
            rows: allFaceDownState.rows.map((r) => {
                const resultingRow = r.map((card) => {
                    if (
                        card.sequenceNumber === targetSequenceNumber ||
                        card.sequenceNumber === clearedSequenceNumber
                    ) {
                        const clearedCard = {
                            ...JSON.parse(JSON.stringify(card)),
                            state: MemoryMatchCardActiveState.CLEARED,
                        };

                        return clearedCard;
                    }

                    return card;
                });

                return resultingRow;
            }),
        };

        it(`should clear the cards`, () => {
            act(
                stateWithOtherCardsCleared,
                {
                    sequenceNumber: targetSequenceNumber,
                },
                (result) => {
                    expect(result).toEqual(fourClearedState);
                }
            );
        });
    });

    describe(`when the cards with the given sequence number have already been cleared`, () => {
        it(`should leave the state unchanged`, () => {
            act(
                targetPairOnlyClearedState,
                {
                    sequenceNumber: targetSequenceNumber,
                },
                (result) => {
                    expect(result).toEqual(targetPairOnlyClearedState);
                }
            );
        });
    });

    describe(`when all cards have been cleared`, () => {
        const allClearedState = {
            ...JSON.parse(JSON.stringify(allFaceDownState)),
            rows: allFaceDownState.rows.map((r) => {
                const resultingRow = r.map((card) => {
                    const clearedCard = JSON.parse(
                        JSON.stringify({
                            ...card,
                            state: MemoryMatchCardActiveState.CLEARED,
                        })
                    );

                    return clearedCard;
                });

                return resultingRow;
            }),
        };

        it(`should leave the state unchanged`, () => {
            act(
                allClearedState,
                {
                    sequenceNumber: targetSequenceNumber,
                },
                (result) => {
                    expect(result).toEqual(allClearedState);
                }
            );
        });
    });
});
