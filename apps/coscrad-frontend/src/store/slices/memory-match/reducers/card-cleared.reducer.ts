import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

type CardClearedPayload = {
    sequenceNumber: number;
};

export const cardClearedReducer = (
    state: MemoryMatchActiveRound,
    { payload }: { type: string; payload: CardClearedPayload }
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
