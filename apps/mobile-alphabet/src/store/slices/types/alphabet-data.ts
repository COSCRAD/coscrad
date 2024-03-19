import { AlphabetCard } from './alphabet-card';

export interface AlphabetData {
    data: {
        name: string;
        name_english: string;
        poster: {
            name: string;
            url: string;
        };
        alphabet_cards: AlphabetCard[];
    };
}
