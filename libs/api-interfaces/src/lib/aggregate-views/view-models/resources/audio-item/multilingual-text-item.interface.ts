import { LanguageCode } from '../../multilingual-text';
import { MultilingualTextItemRole } from './multilingual-text-item-role.enum';

export interface IMultlingualTextItem {
    languageCode: LanguageCode;

    defaultLanguageCode: LanguageCode;

    text: string;

    role: MultilingualTextItemRole;
}
