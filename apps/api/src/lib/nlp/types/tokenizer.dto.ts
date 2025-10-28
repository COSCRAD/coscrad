import { LanguageCode } from '@coscrad/api-interfaces';
import { BooleanDataType, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../domain/common/entities/multilingual-text';

export const TOKENIZER_PROVIDER_INJECTION_TOKEN = 'TOKENIZER_PROVIDER_INJECTION_TOKEN';

/**
 * TODO[naming] This is tough to name. It's meant to be
 * either a (possibly length > 1) string of roman characters
 * that represents either one atomic letter in the target language
 * or punctuation or white space, or else an out-of-alphabet symbol (e.g. in a loan-word)
 *
 * `Character` would be find if it didn't overlap with a basic data type.
 * `Symbol` is also already taken.
 * `Letter` is not sufficient because we want to include out-of-alphabet symbols
 * and punctuation.
 */
export class AlphabetCharacters {
    @NonEmptyString({
        label: 'text',
        description: 'text for this alphabet letter (possibly multiple unicode characters)',
    })
    text: string;

    @BooleanDataType({
        label: 'is punctuation or white space',
        description:
            'flags this symbol as punctuation or white space (and not part of the target alphabet)',
    })
    isPunctuationOrWhiteSpace: boolean;

    @BooleanDataType({
        label: 'is out of alphabet',
        description: 'flags this symbol as out-of-alphabet for the given language',
    })
    isOutOfAlphabet: boolean;

    @BooleanDataType({
        label: 'is upper case',
        description: 'flags this symbol as the upper-case variant',
    })
    isUpperCase: boolean;
}

export class Token {
    @NonEmptyString({
        label: 'text',
        description: 'the full text (all characters joined) for this token',
    })
    text: string;

    @LanguageCodeEnum({
        label: 'language code',
        description: 'language for this token',
    })
    languageCode: LanguageCode;
    /**
     * Note that if `isSpace` and `isPunct` are false, the `symbols` array will
     * be a list of the atomic letters for the given alphabet, which may use
     * multiple unicode symbols to indicate one letter.
     */
    @NestedDataType(AlphabetCharacters, {
        label: 'characters',
        description: 'an ordered list of the letters in this token, atomic to the target alphabet',
        isArray: true,
    })
    characters?: AlphabetCharacters[];
    /**
     * Eventually, we would like to move our NLP to spacy. We are staying
     * close to their API for that reason.
     */
    @BooleanDataType({
        label: 'is space',
        description: 'flags this token as a white space',
    })
    isSpace: boolean;

    @BooleanDataType({
        label: 'is punctuation',
        description: 'flags this token as punctuation in the orthography for the given language',
    })
    isPunct: boolean;

    @BooleanDataType({
        label: 'is stop',
        description: 'flags this token as a stop word in the given language',
    })
    isStop: boolean;
}

export interface ITokenizer {
    /**
     * Do we want this to be async in case we reach out to Spacy out of
     * process in the future? Or will this be handled in a python
     * event handler that receives publications from a messaging queue?
     */
    tokenize(document: string): Token[];
}

export interface ITokenizerProvider {
    has(langaugeCode: LanguageCode): boolean;

    forLanguage(languageCode: LanguageCode): ITokenizer;
}
