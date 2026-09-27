import { IMultilingualText } from '@coscrad/api-interfaces';
import { MemoryMatchCardActiveState } from './memory-match-active-card-state.enum';

export type MemoryMatchActiveCard = {
    row: number;
    column: number;
    sequenceNumber: number; // matches one other card
    audioUrl: string;
    imageUrl: string;
    text?: IMultilingualText;
    // sources?: ResourceCompositeIdentifier[]; // we don't use this right now
    state: MemoryMatchCardActiveState;
};
