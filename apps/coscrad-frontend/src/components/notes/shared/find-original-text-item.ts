import {
    IMultilingualText,
    IMultlingualTextItem,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';

export const findOriginalTextItem = ({
    items,
}: IMultilingualText): Pick<IMultlingualTextItem, 'languageCode' | 'text'> => {
    return items.find(({ role }) => role === MultilingualTextItemRole.original);
};
