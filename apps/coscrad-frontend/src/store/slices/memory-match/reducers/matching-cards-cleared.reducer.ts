import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

export type MatchingCardsClearedActionPayload = {
    sequenceNumber: number;
};

export const matchingCardsClearedReducer = (
    state: MemoryMatchActiveRound,
    { payload }: { type: string; payload: MatchingCardsClearedActionPayload }
): MemoryMatchActiveRound => {
    const { sequenceNumber } = payload;

    const selectedCards = state.rows.flatMap((r) =>
        r.flatMap((c) => (c.state === MemoryMatchCardActiveState.FACE_UP ? [c] : []))
    );

    if (selectedCards.length !== 2) {
        return state;
    }

    state.rows = state.rows.map((row) =>
        row.map((card) => {
            if (card.sequenceNumber !== sequenceNumber) {
                return card;
            }

            card.state = MemoryMatchCardActiveState.CLEARED;

            return card;
        })
    );

    return state;
};
