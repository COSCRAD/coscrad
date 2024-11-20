import { IAlphabetCard } from './alphabet-card.interface';

export interface IAlphabetChart {
    data: {
        name: string;
        name_english: string;
        poster: {
            name: string;
            url: string;
        };
        alphabet_cards: IAlphabetCard[];
    };
}
