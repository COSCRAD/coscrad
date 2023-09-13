import {
    IMultilingualText,
    IMultilingualTextItem,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';

export const findOriginalTextItem = ({
    items,
}: IMultilingualText): Pick<IMultilingualTextItem, 'languageCode' | 'text'> => {
    return items.find(({ role }) => role === MultilingualTextItemRole.original);
};
