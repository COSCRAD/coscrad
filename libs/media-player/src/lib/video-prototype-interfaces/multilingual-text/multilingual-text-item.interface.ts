import { LanguageCode } from '../language-code';
import { MultilingualTextItemRole } from './multilingual-text-item-role.enum';

export interface IMultilingualTextItem {
    languageCode: LanguageCode;

    text: string;

    role: MultilingualTextItemRole;
}
