import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

export type CardFlippedDownActionPayload = {
    row: number;
    column: number;
};

export const cardFlippedDownReducer = (
    state: MemoryMatchActiveRound,
    { payload: { row, column } }: { type: string; payload: CardFlippedDownActionPayload }
): MemoryMatchActiveRound => {
    state.rows[row][column].state = MemoryMatchCardActiveState.FACE_DOWN;

    return state;
};
