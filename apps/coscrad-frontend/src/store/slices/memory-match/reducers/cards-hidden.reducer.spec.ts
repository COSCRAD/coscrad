import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import { MemoryMatchActiveCard } from '../types/memory-match-active-card';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';
import { cardsHiddenReducer } from './cards-hidden.reducer';

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
    checkResult: (newState: MemoryMatchActiveRound) => void
) => {
    const input = JSON.parse(JSON.stringify(initialState));

    const result = cardsHiddenReducer(input, {
        type: 'CARD_FLIPPED',
        // payload, // there is no payload required for this action- should it be `{}`?
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

const matchingTwoFaceUpState = {
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

const nonMatchingCard = bothCopiesOfCards.flatMap((row) =>
    row.flatMap((card) => (card.sequenceNumber !== targetSequenceNumber ? [card] : []))
)[0];

const nonMatchingTwoFaceUpState = {
    ...JSON.parse(JSON.stringify(allFaceDownState)),
    rows: oneFaceUpState.rows.map((r, ri) => {
        const resultingRow = r.map((card, ci) => {
            if (
                isDeepStrictEqual([ri, ci], [alreadyFaceUpCard.row, alreadyFaceUpCard.column]) ||
                isDeepStrictEqual([ri, ci], [nonMatchingCard.row, nonMatchingCard.column])
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

describe(`cardsHiddenReducer`, () => {
    describe(`when no cards are visible`, () => {
        it(`should return the existing state`, () => {
            act(allFaceDownState, (result) => {
                expect(result).toEqual(allFaceDownState);
            });
        });
    });

    describe(`when one card is visible`, () => {
        it(`should return the existing state`, () => {
            act(oneFaceUpState, (result) => {
                expect(result).toEqual(oneFaceUpState);
            });
        });
    });

    describe(`when two cards are visible`, () => {
        describe(`when the cards match`, () => {
            it(`should return the existing state`, () => {
                act(matchingTwoFaceUpState, (result) => {
                    expect(result).toEqual(matchingTwoFaceUpState);
                });
            });
        });

        describe(`when the cards do not match`, () => {
            it(`should put the cards face down`, () => {
                act(nonMatchingTwoFaceUpState, (result) => {
                    expect(result).toEqual(allFaceDownState);
                });
            });
        });
    });
});
