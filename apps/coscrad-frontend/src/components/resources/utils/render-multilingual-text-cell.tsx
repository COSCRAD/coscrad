import { IMultilingualText, LanguageCode } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { groupMultilingualTextItems } from '../../../utils/generic-components/presenters/group-multilingual-text-items';
import { BilingualTextPresenter } from './bilingual-text-presenter';

export const renderMultilingualTextCell = (
    text: IMultilingualText,
    defaultLanguageCode: LanguageCode
) => {
    const { primaryMultilingualTextItem, translations } = groupMultilingualTextItems(
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
