import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

// should this be a selector?
const countSelectedCards = (state: MemoryMatchActiveRound): number =>
    state.rows.flatMap((column) =>
        column.filter((card) => card.state === MemoryMatchCardActiveState.FACE_UP)
    ).length;

type CardFlippedUpPayload = {
    row: number;
    column: number;
};

export const cardFlippedUp = (
    state: MemoryMatchActiveRound,
    action: { type: string; payload: CardFlippedUpPayload }
): MemoryMatchActiveRound => {
    /**
     *
     */
    if (countSelectedCards(state) > 1) {
        return state;
    }

    const { row, column } = action.payload;

    state.rows[row][column].state = MemoryMatchCardActiveState.FACE_UP;

    return state;
};
