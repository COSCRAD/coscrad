import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

export const roundReset = (
    state: MemoryMatchActiveRound,
    _action: { type: string }
): MemoryMatchActiveRound => {
    state.rows = state.rows.map((row) =>
        row.map((card) => {
            return JSON.parse(
                JSON.stringify({
                    ...card,
                    state: MemoryMatchCardActiveState.FACE_DOWN,
                })
            );
        })
    );

    return state;
};
