import { IMultilingualText, LanguageCode } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { formatBilingualText } from '../../../components/resources/vocabulary-lists/utils';
import { getTextItemsForMultilingualTextPresenter } from '../../../utils/generic-components/presenters/get-text-items-for-multilingual-text-presenter';

export const renderMultilingualTextCell = (
    text: IMultilingualText,
    defaultLanguageCode: LanguageCode
) => {
    const { primaryMultilingualTextItem, translations } = getTextItemsForMultilingualTextPresenter(
        text,
        defaultLanguageCode
    );

    const { languageCode: primaryMultilingualTextItemLanguageCode } = primaryMultilingualTextItem;

    const searchResultForSecondaryLanguage =
        primaryMultilingualTextItemLanguageCode === LanguageCode.English
            ? null
            : translations.find(({ languageCode }) => languageCode === LanguageCode.English);

    return (
        <Typography variant="body1">
            {formatBilingualText(
                primaryMultilingualTextItem.text,
                searchResultForSecondaryLanguage?.text
            )}
        </Typography>
    );
};
