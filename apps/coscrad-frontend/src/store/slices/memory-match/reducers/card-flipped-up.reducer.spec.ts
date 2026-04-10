import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { MemoryMatchActiveCard } from '../types/memory-match-active-card';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';
import { cardFlippedUp } from './card-fipped-up.reducer';

const N_UNIQUE_CARDS = 12;

const TOTAL_CARDS = 2 * N_UNIQUE_CARDS;

const N_ROWS = 6;

const N_COLUMNS = TOTAL_CARDS / N_ROWS;

const buildCard = (
    row: number,
    column: number,
    state: MemoryMatchCardActiveState
): MemoryMatchActiveCard => {
    const sequenceNumber = row * N_ROWS + column;

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

const act = (
    initialState: MemoryMatchActiveRound,
    payload: { row: number; column: number },
    checkResult: (newState: MemoryMatchActiveRound) => void
) => {
    const input = JSON.parse(JSON.stringify(initialState));

    const result = cardFlippedUp(input, {
        type: 'CARD_FLIPPED',
        payload,
    });

    checkResult(result);
};

describe(`cardFlippedUp (memory match reducer)`, () => {
    describe(`when no cards are yet selected`, () => {
        const targetRow = 2;

        const targetColumn = 1;

        it(`should flip the target card`, () => {
            act(
                allFaceDownState,
                {
                    row: targetRow,
                    column: targetColumn,
                },
                (result) => {
                    expect(result.rows[2][1].state).toBe(MemoryMatchCardActiveState.FACE_UP);

                    result.rows.forEach((row, ri) =>
                        row.forEach((col, ci) => {
                            if (ri === 2) {
                                return;
                            }

                            if (ci === 1) {
                                return;
                            }

                            // no other cards should have flipped
                            expect(col.state).toBe(MemoryMatchCardActiveState.FACE_DOWN);
                        })
                    );
                }
            );
        });
    });

    describe(`when one card is already selected`, () => {
        const [alreadyFaceUpCard, cardThatMatchesAlreadyFaceUpCard] = cardsWithTargetSequenceNumber;

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

        describe(`when it is not the same card that is now being selected`, () => {
            describe(`when the card matches the first selected card`, () => {
                const cardToFlip = cardThatMatchesAlreadyFaceUpCard;

                const { column: targetColumn, row: targetRow } = cardToFlip;

                const stateWithFirstMatchingCardFaceUp = oneFaceUpState;

                it(`should flip both cards face up`, () => {
                    act(
                        stateWithFirstMatchingCardFaceUp,
                        {
                            row: targetRow,
                            column: targetColumn,
                        },
                        (result) => {
                            const updatedFirstCard =
                                result.rows[alreadyFaceUpCard.row][alreadyFaceUpCard.column];

                            const updatedSecondCard =
                                result.rows[cardThatMatchesAlreadyFaceUpCard.row][
                                    cardThatMatchesAlreadyFaceUpCard.column
                                ];

                            expect(updatedFirstCard.state).toEqual(
                                MemoryMatchCardActiveState.FACE_UP
                            );

                            expect(updatedSecondCard.state).toEqual(
                                MemoryMatchCardActiveState.FACE_UP
                            );
                        }
                    );
                });
            });
        });

        describe(`when the card to flip has already been selected`, () => {
            it(`should leave the state unchanged`, () => {
                act(
                    oneFaceUpState,
                    {
                        row: alreadyFaceUpCard.row,
                        column: alreadyFaceUpCard.column,
                    },
                    (result) => {
                        expect(result).toEqual(oneFaceUpState);
                    }
                );
            });
        });

        describe(`when the flipped card has already been selected`, () => {
            it(`should leave the state unchanged`, () => {
                act(
                    oneFaceUpState,
                    {
                        row: alreadyFaceUpCard.row,
                        column: alreadyFaceUpCard.column,
                    },
                    (result) => {
                        expect(result).toEqual(oneFaceUpState);
                    }
                );
            });
        });
    });

    describe(`when two cards are already selected`, () => {
        const firstFaceUpCardLocation = [3, 2];

        const secondFaceUpCardLocation = [1, 3];

        const payload = {
            row: 2,
            column: 1,
        };

        it(`should have no effect`, () => {
            const twoUpState = {
                ...allFaceDownState,
                rows: allFaceDownState.rows.map((r, ri) => {
                    const resultingRow = r.map((card, ci) => {
                        if (
                            isDeepStrictEqual([ri, ci], firstFaceUpCardLocation) ||
                            isDeepStrictEqual([ri, ci], secondFaceUpCardLocation)
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

            act(twoUpState, payload, (result) => {
                expect(result).toEqual(twoUpState);
            });
        });
    });
});
