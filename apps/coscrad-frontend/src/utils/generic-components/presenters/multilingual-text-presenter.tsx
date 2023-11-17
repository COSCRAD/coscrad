import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import { useContext } from 'react';
import { findOriginalTextItem } from '../../../components/notes/shared/find-original-text-item';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { findTextItemByLanguageCode } from './find-text-item-by-language-code';
import { MultilingualTextItemPresenter } from './multilingual-text-item-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { items } = text;

    const textItemWithDefaultLanguage = findTextItemByLanguageCode(text, defaultLanguageCode);

    const primaryMultilingualTextItem = isNullOrUndefined(textItemWithDefaultLanguage)
        ? { ...findOriginalTextItem({ items }), role: 'original' }
        : textItemWithDefaultLanguage;

    const translations = items?.filter((items) => items.languageCode !== defaultLanguageCode);

    return (
        <Box width={'fit-content'} data-testid="multilingual-text-display">
            <Accordion elevation={0}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    data-testid="multilingual-text-main-text-item"
                >
                    <MultilingualTextItemPresenter
                        variant="h4"
                        item={primaryMultilingualTextItem}
                    />
                </AccordionSummary>
                <AccordionDetails data-testid="multilingual-text-translations">
                    {translations.map((item) => (
                        <MultilingualTextItemPresenter variant="body1" item={item} />
                    ))}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
