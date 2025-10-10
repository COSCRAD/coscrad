import { IMultilingualText } from '../../resources';
import { IMemoryMatchCard } from './memory-match-card.interface';

export interface IMemoryMatchRound {
    name: IMultilingualText;
    // Note that card back is not a compound word so it becomes `cardBack` in camel case. See [here](https://mtg.fandom.com/wiki/Card_back)
    cardBackImageUrl?: string;
    cards: IMemoryMatchCard[];
    // This is for the admin users
    isPublished: boolean;
    // TODO return a more detailed format
    contributors: string[];
    size: number; // always 12 right now
}
