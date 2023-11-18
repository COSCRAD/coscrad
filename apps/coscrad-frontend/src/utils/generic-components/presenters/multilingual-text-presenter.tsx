import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import { Accordion, AccordionSummary, Box, SxProps } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { getOriginalTextItem } from './get-original-text-item';
import { getTextItemByLanguageCode } from './get-text-item-by-language-code';
import { getTextItemsNotInLanguage } from './get-text-items-not-in-language';
import { MultilingualTextItemPresenter } from './multilingual-text-item-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const textItemWithDefaultLanguage = getTextItemByLanguageCode(text, defaultLanguageCode);

    const primaryMultilingualTextItem = isNullOrUndefined(textItemWithDefaultLanguage)
        ? getOriginalTextItem(text)
        : textItemWithDefaultLanguage;

    const { languageCode: languageCodeOfPrimaryTextItem } = primaryMultilingualTextItem;

    const translations = getTextItemsNotInLanguage(text, languageCodeOfPrimaryTextItem);

    const isTranslated: boolean = translations.length > 0 ? true : false;

    const sxPropsWhenNoTranslations: SxProps = isTranslated ? {} : { minHeight: 0, height: 0 };

    return (
        <Box width={'fit-content'} data-testid="multilingual-text-display">
            <Accordion elevation={0} expanded={translations.length > 0 ? false : true}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    data-testid="multilingual-text-main-text-item"
                >
                    <MultilingualTextItemPresenter
                        variant="h4"
                        item={primaryMultilingualTextItem}
                    />
                </AccordionSummary>
                {/* <AccordionDetails
                    data-testid="multilingual-text-translations"
                    sx={sxPropsWhenNoTranslations}
                >
                    {translations.map((item) => (
                        <MultilingualTextItemPresenter variant="body1" item={item} />
                    ))}
                </AccordionDetails> */}
            </Accordion>
        </Box>
    );
};
