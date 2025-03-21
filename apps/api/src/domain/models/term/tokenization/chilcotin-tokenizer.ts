import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ITokenizer } from './tokenizer.interface';

('’ɨʔŝẑŵ');

export class ChilcotinTokenizer implements ITokenizer {
    private vowels = ['a', 'e', 'i', 'ɨ', 'u', 'o'];

    private consonants = [
        'b',
        'p',
        'm',
        'd',
        't',
        't’',
        'n',
        'dl',
        'tl’',
        'lh',
        'l',
        'dẑ',
        'tŝ',
        'tŝ’',
        'ŝ',
        'ẑ',
        'dz',
        'ts',
        'ts’',
        's',
        'z',
        'j',
        'ch',
        'ch’',
        'sh',
        'y',
        'g',
        'k',
        'k’',
        'gw',
        'kw',
        'kw’',
        'wh',
        'w',
        'gg',
        'q',
        'q’',
        'x',
        'gh',
        'ggw',
        'qw',
        'qw’',
        'xw',
        'ŵ',
        'ʔ',
        'h',
    ];

    private alphabet = [...this.vowels, ...this.consonants];

    tokenize(document: string): {
        text: string;
        languageCode: LanguageCode;
        symbols: string[];
        isSpace: boolean;
        isPunct: boolean;
        isStop: boolean;
    }[] {
        const rawTokens = document.split(' ');

        return rawTokens.map((text) => {
            const symbols = this.separateLetters(text);

            return {
                text,
                symbols,
                languageCode: LanguageCode.Chilcotin,
                // TODO "zip" in the spaces
                isSpace: false,
                // TODO split out punctuation
                isPunct: false,
                // TODO accept stopwords via constructor?
                isStop: false,
            };
        });
    }

    private separateLetters(_token: string): string[] {
        throw new InternalError(`Not Implemented`);
    }
}
