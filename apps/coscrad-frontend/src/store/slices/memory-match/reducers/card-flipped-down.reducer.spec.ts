import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';
import { cardFlippedDown } from './card-flipped-down.reducer';

const firstSelectedCardLocation = [1, 2];

const secondSelectedCardLocation = [4, 3];

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

    const result = cardFlippedDown(input, {
        type: 'CARD_FLIPPED',
        payload,
    });

    checkResult(result);
};

const oneFaceUpState = {
    ...allFaceDownState,
    rows: allFaceDownState.rows.map((r, ri) => {
        const resultingRow = r.map((card, ci) => {
            if (isDeepStrictEqual([ri, ci], firstSelectedCardLocation)) {
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

describe(`cardFlippedDown (memory match reducer)`, () => {
    describe(`when no cards are selected`, () => {
        it(`should have no effect`, () => {
            act(allFaceDownState, { row: 1, column: 1 }, (result) => {
                expect(result).toEqual(allFaceDownState);
            });
        });
    });

    describe(`when one card is selected`, () => {
        describe(`when the face-up card is targetted to be flipped`, () => {
            it(`should result in all cards being face down`, () => {
                act(
                    oneFaceUpState,
                    { row: firstSelectedCardLocation[0], column: firstSelectedCardLocation[1] },
                    (result) => {
                        expect(result).toEqual(allFaceDownState);
                    }
                );
            });
        });

        describe(`when a face-down card is targetted to be flipped`, () => {
            it(`should have no effect`, () => {
                act(oneFaceUpState, { row: 4, column: 4 }, (result) => {
                    expect(result).toEqual(oneFaceUpState);
                });
            });
        });
    });

    describe(`when two cards are selected`, () => {
        const twoCardSelectedState = {
            ...allFaceDownState,
            rows: allFaceDownState.rows.map((r, ri) => {
                const resultingRow = r.map((card, ci) => {
                    if (
                        isDeepStrictEqual([ri, ci], firstSelectedCardLocation) ||
                        isDeepStrictEqual([ri, ci], secondSelectedCardLocation)
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

        describe(`when one of the face-up cards is targetted to be flipped`, () => {
            it(`should leave only the other selected card face up`, () => {
                act(
                    twoCardSelectedState,
                    {
                        row: secondSelectedCardLocation[0],
                        column: secondSelectedCardLocation[1],
                    },
                    (result) => {
                        expect(result).toEqual(oneFaceUpState);
                    }
                );
            });
        });

        describe(`when the card that is targetted to be flipped is not one of the face up cards`, () => {
            it(`should have no effect`, () => {
                act(
                    twoCardSelectedState,
                    {
                        row: 0,
                        column: 1,
                    },
                    (result) => {
                        expect(result).toEqual(twoCardSelectedState);
                    }
                );
            });
        });
    });
});
