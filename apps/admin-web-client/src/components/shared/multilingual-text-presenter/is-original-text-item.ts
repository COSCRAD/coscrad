import { IMultilingualTextItem, MultilingualTextItemRole } from '@coscrad/api-interfaces';

export const isOriginalTextItem = (textItem: IMultilingualTextItem): boolean => {
    return textItem.role === MultilingualTextItemRole.original;
};
