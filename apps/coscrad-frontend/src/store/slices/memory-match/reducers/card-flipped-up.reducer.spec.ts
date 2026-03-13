import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';
import { cardFlippedUp } from './card-fipped-up.reducer';

const N_CARDS = 12;

const N_ROWS = 4;

const N_COLUMNS = (2 * N_CARDS) / N_ROWS;

const buildCard = (row: number, column: number, id: number, state: MemoryMatchCardActiveState) => {
    const sequenceNumber = row * N_ROWS + column;

    return {
        id,
        row,
        column,
        sequenceNumber,
        audioUrl: `https://www.mylalala.com/${sequenceNumber + 1}.mp3`,
        imageUrl: `https://www.mypicstorage.com/${sequenceNumber + 1}.png`,
        state,
    };
};

const oneCopyOfCards = Array(N_ROWS)
    .fill(null)
    .map((_, row) =>
        Array(N_COLUMNS)
            .fill(null)
            .map((_, col) =>
                buildCard(row, col, row * N_ROWS + col, MemoryMatchCardActiveState.FACE_DOWN)
            )
    );

const bothCopiesOfCards = [
    ...oneCopyOfCards,
    ...oneCopyOfCards.map((row) =>
        row.map((card) => ({
            ...JSON.parse(JSON.stringify(card)),
            id: card.id + N_ROWS,
        }))
    ),
];

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

                    if (card.state !== MemoryMatchCardActiveState.FACE_DOWN) {
                        console.log(`here bitch`);
                    }

                    // the rest should still be face-down
                    expect(card.state).toBe(MemoryMatchCardActiveState.FACE_DOWN);
                })
            );
        };

        describe(`when it is not the same card that is now being selected`, () => {
            it(`should flip the second card`, () => {
                act(
                    oneFaceUpState,
                    {
                        row: targetRow,
                        column: targetColumn,
                    },
                    checkThatTargetCardWasFlipped
                );
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
