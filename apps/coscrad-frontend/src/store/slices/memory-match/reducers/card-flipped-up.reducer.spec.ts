import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { MemoryMatchActiveCard } from '../types/memory-match-active-card';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';
import { cardFlippedUp } from './card-fipped-up.reducer';

const N_CARDS = 24;

const N_ROWS = 6;

const N_COLUMNS = N_CARDS / N_ROWS;

const buildCard = (
    row: number,
    column: number,
    id: number,
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

const oneCopyOfCards = Array(N_ROWS / 2)
    .fill(null)
    .map((_, row) =>
        Array(N_COLUMNS)
            .fill(null)
            .map((_, col) =>
                buildCard(row, col, row * N_ROWS + col, MemoryMatchCardActiveState.FACE_DOWN)
            )
    );

const secondCopyOfCards = oneCopyOfCards.map((row) =>
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

const alreadyFaceUpRow = 1;

const alreadyFaceUpColumn = 2;

const oneFaceUpState = {
    ...JSON.parse(JSON.stringify(allFaceDownState)),
    rows: allFaceDownState.rows.map((r, ri) => {
        const resultingRow = r.map((card, ci) => {
            if (ri === alreadyFaceUpRow && ci === alreadyFaceUpColumn) {
                return {
                    ...JSON.parse(JSON.stringify(card)),
                    state: MemoryMatchCardActiveState.FACE_UP,
                };
            }

            return card;
        });

        return resultingRow;
    }),
};

const targetRow = 0;

const targetColumn = 1;

describe(`cardFlippedUp (memory match reducer)`, () => {
    describe(`when no cards are yet selected`, () => {
        it(`should flip the target card`, () => {
            act(
                allFaceDownState,
                {
                    row: 2,
                    column: 1,
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
        const checkThatTargetCardWasFlipped = (result) => {
            expect(result.rows[targetRow][targetColumn].state).toBe(
                MemoryMatchCardActiveState.FACE_UP
            );

            expect(result.rows[alreadyFaceUpRow][alreadyFaceUpColumn].state).toBe(
                MemoryMatchCardActiveState.FACE_UP
            );

            result.rows.forEach((row, ri) =>
                row.forEach((card, ci) => {
                    if (
                        isDeepStrictEqual([ri, ci], [targetRow, targetColumn]) ||
                        isDeepStrictEqual([ri, ci], [alreadyFaceUpRow, alreadyFaceUpColumn])
                    ) {
                        return;
                    }

                    // the rest should still be face-down
                    expect(card.state).toBe(MemoryMatchCardActiveState.FACE_DOWN);
                })
            );
        };

        describe(`when it is not the same card that is now being selected`, () => {
            describe(`when the card matches the first selected card`, () => {
                const targetSequenceNumber = 0;

                const cardsWithSequenceNumber = bothCopiesOfCards
                    .flatMap((row) => row)
                    .filter(({ sequenceNumber }) => sequenceNumber === targetSequenceNumber);

                const [firstFaceUpCardLocation, secondFaceUpCardLocation] = cardsWithSequenceNumber;

                const stateWithFirstMatchingCardFaceUp = {
                    ...allFaceDownState,
                    rows: allFaceDownState.rows.map((r, ri) => {
                        const resultingRow = r.map((card, ci) => {
                            // the first card is face up already
                            if (isDeepStrictEqual([ri, ci], firstFaceUpCardLocation)) {
                                return {
                                    ...JSON.parse(JSON.stringify(card)),
                                    state: MemoryMatchCardActiveState.FACE_UP,
                                };
                            }

                            return card;
                        });

                        return resultingRow;
                    }),
                };

                // TODO make sure we are flipping the right card here
                it.only(`should flip both cards face up`, () => {
                    act(
                        stateWithFirstMatchingCardFaceUp,
                        {
                            row: targetRow,
                            column: targetColumn,
                        },
                        (result) => {
                            const updatedFirstCard =
                                result.rows[firstFaceUpCardLocation.row][
                                    firstFaceUpCardLocation.column
                                ];

                            const updatedSecondCard =
                                result.rows[secondFaceUpCardLocation.row][
                                    secondFaceUpCardLocation.column
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

        describe(`when the flipped card has already been selected`, () => {
            act(
                oneFaceUpState,
                { row: targetRow, column: targetColumn },
                checkThatTargetCardWasFlipped
            );
        });
    });

    describe(`when two cards are already selected`, () => {
        const firstFaceUpCardLocation = [3, 2];

        const secondFaceUpCardLocation = [1, 4];

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
                            return {
                                ...JSON.parse(JSON.stringify(card)),
                                state: MemoryMatchCardActiveState.FACE_UP,
                            };
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
