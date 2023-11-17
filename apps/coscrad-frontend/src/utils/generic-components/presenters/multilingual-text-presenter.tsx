import { IMultilingualText, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { MultilingualTextItemPresenter } from './multilingual-text-item-presenter';

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { items } = text;

    const textItemWithDefaultLanguage =
        items?.find((item) => item.languageCode === defaultLanguageCode) || null;

    const primaryMultilingualTextItem = isNullOrUndefined(textItemWithDefaultLanguage)
        ? items?.find((item) => item.role === MultilingualTextItemRole.original)
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
