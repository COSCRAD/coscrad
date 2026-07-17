import { isEmptyText } from './isEmptyText';

export const formatBilingualText = (
    textInPrimaryLanguage: string,
    textInSecondaryLanguage: string
): string => {
    if (isEmptyText(textInSecondaryLanguage)) return textInPrimaryLanguage;

    return isEmptyText(textInPrimaryLanguage)
        ? textInSecondaryLanguage
        : `${textInPrimaryLanguage} (${textInSecondaryLanguage})`;
};
