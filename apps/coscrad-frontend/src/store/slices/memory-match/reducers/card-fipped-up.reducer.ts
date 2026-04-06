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
    const previouslySelectedCards = getSelectedCards(state);

    const { row, column } = action.payload;

    const cardToFlip = state.rows[row][column];

    if (cardToFlip.state === MemoryMatchCardActiveState.FACE_UP) {
        // the card was already face-up- nothing to do
        return state;
    }

    if (cardToFlip.state === MemoryMatchCardActiveState.CLEARED) {
        // we don't respond to requests to flip a card that has already been cleared
        return state;
    }

    if (previouslySelectedCards.length < 2) {
        cardToFlip.state = MemoryMatchCardActiveState.FACE_UP;

        return state;
    }

    return state;
};
