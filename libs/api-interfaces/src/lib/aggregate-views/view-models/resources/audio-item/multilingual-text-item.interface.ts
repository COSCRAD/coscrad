import { LanguageCode } from '../../multilingual-text';
import { MultiLingualTextItemRole } from './multilingual-text-item-role.enum';

export interface IMultlingualTextItem {
    languageId: LanguageCode;

    text: string;

    role: MultiLingualTextItemRole;
}
