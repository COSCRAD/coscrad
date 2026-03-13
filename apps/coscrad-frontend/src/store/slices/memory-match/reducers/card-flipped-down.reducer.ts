import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

type CardFlippedDownPayload = {
    row: number;
    column: number;
};

export const cardFlippedDown = (
    state: MemoryMatchActiveRound,
    { payload: { row, column } }: { type: string; payload: CardFlippedDownPayload }
): MemoryMatchActiveRound => {
    state.rows[row][column].state = MemoryMatchCardActiveState.FACE_DOWN;

    return state;
};
