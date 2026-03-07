import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';
import { cardFlipped } from './card-fipped.reducer';

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
            ...card,
            id: card.id + N_ROWS,
        }))
    ),
];

const allFaceUpState: MemoryMatchActiveRound = {
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

describe(`card_flipped (memory match reducer)`, () => {
    describe(`when no cards are yet selected`, () => {
        it(`should flip the target card`, () => {
            const result = cardFlipped(allFaceUpState, {
                type: 'CARD_FLIPPED',
                payload: {
                    row: 2,
                    column: 1,
                },
            });

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
        });
    });

    describe(`when one card is already selected`, () => {
        describe(`when it is not the same card that is now being selected`, () => {
            const alreadyFaceUpRow = 1;

            const alreadyFaceUpColumn = 2;

            const targetRow = 0;

            const targetColumn = 1;

            const oneFaceUpState = {
                ...allFaceUpState,
                rows: allFaceUpState.rows.map((r, ri) =>
                    r.map((card, ci) =>
                        ri === alreadyFaceUpRow && ci === alreadyFaceUpColumn
                            ? {
                                  ...card,
                                  state: MemoryMatchCardActiveState.FACE_UP,
                              }
                            : card
                    )
                ),
            };

            it(`should flip the second card`, () => {
                const result = cardFlipped(oneFaceUpState, {
                    type: 'CARD_FLIPPED',
                    payload: {
                        row: targetRow,
                        column: targetColumn,
                    },
                });

                expect(result.rows[targetRow][targetColumn].state).toBe(
                    MemoryMatchCardActiveState.FACE_UP
                );

                expect(result.rows[alreadyFaceUpColumn][alreadyFaceUpColumn].state).toBe(
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
            });
        });
    });

    describe(`when two cards are already selected`, () => {
        it.todo(`should have no effect`);
    });
});
