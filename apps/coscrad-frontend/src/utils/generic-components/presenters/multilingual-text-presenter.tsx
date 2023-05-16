import { IMultilingualText } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LanguageIcon from '@mui/icons-material/Language';
import {
    Accordion,
    AccordionSummary,
    Box,
    Divider,
    IconButton,
    Tooltip,
    Typography,
} from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { getLabelForLanguage } from './text-presenters/get-label-for-language';
import { TranslatedLanguageTextPresenter } from './text-presenters/translated-text-presenter';

// TODO use contentConfigContext
// default language code
// find the text iterm with the default language code
// find the text item with english
// note: either of these may not exist (fallback logic)
// build an appropriate presentation of these properties

export interface MultilingualTextPresenterProps {
    text: IMultilingualText;
}

export const MultilingualTextPresenter = ({
    text,
}: MultilingualTextPresenterProps): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { items } = text;

    const textItemWithDefaultLanguage =
        items.find((item) => item.languageCode === defaultLanguageCode) || null;

    const translations = items.filter((items) => items.languageCode !== defaultLanguageCode);

    return (
        <Box>
            <Accordion defaultExpanded variant="outlined">
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h3" sx={{ margin: '0' }}>
                        {isNullOrUndefined(textItemWithDefaultLanguage)
                            ? 'Translations'
                            : textItemWithDefaultLanguage.text}
                    </Typography>
                    <Tooltip
                        title={`${getLabelForLanguage(
                            textItemWithDefaultLanguage.languageCode
                        )}, '${textItemWithDefaultLanguage.role}'`}
                    >
                        <IconButton>
                            <LanguageIcon />
                        </IconButton>
                    </Tooltip>
                </AccordionSummary>
                <Divider />

                {translations.map(({ languageCode, text, role }) => (
                    <TranslatedLanguageTextPresenter
                        languageCode={languageCode}
                        text={text}
                        role={role}
                    />
                ))}
            </Accordion>
        </Box>
    );
};
