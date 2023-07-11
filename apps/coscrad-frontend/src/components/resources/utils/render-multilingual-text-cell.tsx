import { IMultilingualText, LanguageCode } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { formatBilingualText } from '../../../components/resources/vocabulary-lists/utils';

export const renderMultilingualTextCell = (
    text: IMultilingualText,
    defaultLanguageCode: LanguageCode
) => {
    const originalTextItem = text.items.find(({ role }) => role === 'original');

    const { languageCode: originalTextItemLanguageCode } = originalTextItem;

    const secondaryLanguageCode =
        originalTextItemLanguageCode === defaultLanguageCode
            ? LanguageCode.English
            : defaultLanguageCode;

    const searchResultForSecondaryLanguage = text.items.find(
        ({ languageCode }) => languageCode === secondaryLanguageCode
    );

    return (
        <Typography variant="body1">
            {formatBilingualText(originalTextItem.text, searchResultForSecondaryLanguage?.text)}
        </Typography>
    );
};
