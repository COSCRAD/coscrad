import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

type CardFlippedPayload = {
    row: number;
    column: number;
};

export const cardFlipped = (
    state: MemoryMatchActiveRound,
    action: { type: string; payload: CardFlippedPayload }
): MemoryMatchActiveRound => {
    const { row, column } = action.payload;

    state.rows[row][column].state = MemoryMatchCardActiveState.FACE_UP;

    return state;
};
