import { MemoryMatchCardActiveState } from '../types/memory-match-active-card-state.enum';
import { MemoryMatchActiveRound } from '../types/memory-match-active-round';

export const cardsHiddenReducer = (
    state: MemoryMatchActiveRound,
    _action: { type: string }
): MemoryMatchActiveRound => {
    const visibleCards = state.rows.flatMap((row) =>
        row.flatMap((card) => (card.state === MemoryMatchCardActiveState.FACE_UP ? [card] : []))
    );

    if (visibleCards.length !== 2) {
        return state;
    }

    if (visibleCards[0].sequenceNumber === visibleCards[1].sequenceNumber) {
        /**
         * You must dispatch `cardsCleared` instead.
         */
        return state;
    }

    // we know we have a pair of non-matching cards, so we can hide them
    visibleCards.forEach((c) => (c.state = MemoryMatchCardActiveState.FACE_DOWN));

    return state;
};
