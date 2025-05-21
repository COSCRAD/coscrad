import { LanguageCode } from '../../../multilingual-text';
import { MultilingualTextItemRole } from './multilingual-text-item-role.enum';
import { ITextToken } from './text-token.interface';

export interface IMultilingualTextItem {
    languageCode: LanguageCode;

    text: string;

    role: MultilingualTextItemRole;

    /**
     * An ordered list of tokens, each of which is a list
     * of `AlphabetCharcters` or out of alphabet symbols (e.g. punctuation, foreign letters)
     */
    // TODO make this required when we opt into parsing all MultilingualText on views
    tokens?: ITextToken[];
}
