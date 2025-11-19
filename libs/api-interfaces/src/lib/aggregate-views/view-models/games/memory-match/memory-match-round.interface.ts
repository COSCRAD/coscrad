import { IContributionSummary } from '../../base.view-model.interface';
import { IMultilingualText } from '../../resources';
import { IMemoryMatchCard } from './memory-match-card.interface';

export interface IMemoryMatchRound {
    // type?
    id: string;
    name: IMultilingualText;
    cardbackImageUrl: string;
    cards: IMemoryMatchCard[];
    // This is for the admin users
    isPublished: boolean;
    contributors: IContributionSummary[];
    size: number; // always 12 right now
}
