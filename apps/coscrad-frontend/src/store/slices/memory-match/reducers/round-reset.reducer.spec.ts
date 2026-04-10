import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { MemoryMatchActiveCard } from '../types/memory-match-active-card';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';
import { roundReset } from './round-reset.reducer';

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

    const result = roundReset(input, {
        type: 'CARD_FLIPPED',
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

const allClearedState = {
    ...JSON.parse(JSON.stringify(allFaceDownState)),
    rows: allFaceDownState.rows.map((r) => {
        const resultingRow = r.map((card) => {
            const clearedCard = {
                ...JSON.parse(JSON.stringify(card)),
                state: MemoryMatchCardActiveState.CLEARED,
            };

            return clearedCard;
        });

        return resultingRow;
    }),
};

const twoClearedState = {
    ...JSON.parse(JSON.stringify(twoFaceUpState)),
    rows: twoFaceUpState.rows.map((r, ri) => {
        const resultingRow = r.map((card, ci) => {
            if (card.state === MemoryMatchCardActiveState.FACE_UP) {
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

const assertRoundHasBeenReset = (result: unknown) => {
    expect(result).toEqual(allFaceDownState);
};

describe(`roundResetReducer`, () => {
    describe(`when no cards have been cleared`, () => {
        it(`should reset the state`, () => {
            act(allFaceDownState, assertRoundHasBeenReset);
        });
    });

    describe(`when one card is face up`, () => {
        it(`should reset the state`, () => {
            act(oneFaceUpState, assertRoundHasBeenReset);
        });
    });

    describe(`when two cards are face up`, () => {
        it(`should reset the state`, () => {
            act(twoFaceUpState, assertRoundHasBeenReset);
        });
    });

    describe(`when two cards have been cleared`, () => {
        it(`should reset the state`, () => {
            act(twoClearedState, assertRoundHasBeenReset);
        });
    });

    describe(`when the entire board has been cleared`, () => {
        it(`should reset the state`, () => {
            act(allClearedState, assertRoundHasBeenReset);
        });
    });
});
