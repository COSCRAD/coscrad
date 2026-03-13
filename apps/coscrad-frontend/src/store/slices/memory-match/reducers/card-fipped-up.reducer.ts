import { MemoryMatchActiveCard } from '../types/memory-match-active-card';
import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

// should this be a selector?
const getSelectedCards = (state: MemoryMatchActiveRound): MemoryMatchActiveCard[] =>
    state.rows.flatMap((column) =>
        column.filter((card) => card.state === MemoryMatchCardActiveState.FACE_UP)
    );

type CardFlippedUpPayload = {
    row: number;
    column: number;
};

export const cardFlippedUp = (
    state: MemoryMatchActiveRound,
    action: { type: string; payload: CardFlippedUpPayload }
): MemoryMatchActiveRound => {
    const selectedCards = getSelectedCards(state);

    const { row, column } = action.payload;

    if (selectedCards.length === 1) {
        const [firstCard] = selectedCards;

        const secondCard = state.rows[row][column];

        if (firstCard.sequenceNumber === secondCard.sequenceNumber) {
            state.rows[firstCard.row][firstCard.column].state = MemoryMatchCardActiveState.CLEARED;
            state.rows[secondCard.row][secondCard.column].state =
                MemoryMatchCardActiveState.CLEARED;
        }
    }

    /**
     *
     */
    if (selectedCards.length > 1) {
        return state;
    }

    if (state.rows[row][column]) state.rows[row][column].state = MemoryMatchCardActiveState.FACE_UP;

    return state;
};
