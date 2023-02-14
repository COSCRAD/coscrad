import { LanguageCode } from '../../multilingual-text';
import { MultilingualTextItemRole } from './multilingual-text-item-role.enum';

export interface IMultlingualTextItem {
    languageCode: LanguageCode;

    text: string;

    role: MultilingualTextItemRole;
}
