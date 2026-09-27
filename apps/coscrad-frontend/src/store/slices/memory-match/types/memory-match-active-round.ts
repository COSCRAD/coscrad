import { IContributionSummary, IMultilingualText } from '@coscrad/api-interfaces';
import { MemoryMatchActiveCard } from './memory-match-active-card';

export type MemoryMatchActiveRound = {
    id: string;
    name: IMultilingualText;
    cardbackImageUrl: string;
    contributors: IContributionSummary[];
    size: number;
    // row X column
    rows: MemoryMatchActiveCard[][];
};
