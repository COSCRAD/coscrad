export interface AlphabetCard {
    letter: string;
    word: string;
    //be careful this is a string, should be parsed
    sequence_number: string;
    letter_audio: string;
    word_audio: string;
    standalone_image: string;
    card_image: string;
}
