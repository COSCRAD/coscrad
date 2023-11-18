import {
    IMultilingualText,
    IMultilingualTextItem,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';

export const getOriginalTextItem = ({ items }: IMultilingualText): IMultilingualTextItem => {
    return items.find(({ role }) => role === MultilingualTextItemRole.original);
};
