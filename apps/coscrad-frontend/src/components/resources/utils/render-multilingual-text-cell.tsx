import { IMultilingualText, LanguageCode } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { getTextItemsForMultilingualTextPresenter } from '../../../utils/generic-components/presenters/get-text-items-for-multilingual-text-presenter';
import { BilingualTextPresenter } from './bilingual-text-presenter';

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
            <BilingualTextPresenter
                textInPrimaryLanguage={primaryMultilingualTextItem.text}
                textInSecondaryLanguage={searchResultForSecondaryLanguage?.text}
            />
        </Typography>
    );
};
