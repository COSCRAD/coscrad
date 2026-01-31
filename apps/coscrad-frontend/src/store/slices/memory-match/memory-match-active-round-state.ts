/**
 * EVENTs
 * CARD FACE_UP or CARD_FLIPPED
 * CARD_FACE_DOWN or CARD_FLIPPED
 * CARD_CLEARED
 *
 * ---
 *
 * CARD_CLICKED
 */

enum MemoryMatchActiveCardVisibility {
    FACE_UP = 'FACE_UP',
    FACE_DOWN = 'FACE_DOWN',
    CLEARED = 'CLEARED',
}

export type MemoryMatchActiveCardState = {
    visibility: MemoryMatchActiveCardVisibility;
};

export type MemoryMatchActiveRoundState = {
    cardsByRow: Map<string, Map<string, MemoryMatchActiveCardState>>;
};
